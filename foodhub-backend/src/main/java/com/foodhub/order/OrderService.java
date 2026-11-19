package com.foodhub.order;

import com.foodhub.common.ConflictException;
import com.foodhub.common.InvalidOrderException;
import com.foodhub.common.InvalidOrderStatusException;
import com.foodhub.common.InvalidRequestException;
import com.foodhub.common.PageResponse;
import com.foodhub.common.ResourceNotFoundException;
import com.foodhub.menu.Menu;
import com.foodhub.menu.MenuItem;
import com.foodhub.menu.MenuRepository;
import com.foodhub.order.dto.OrderItemRequest;
import com.foodhub.order.dto.OrderResponse;
import com.foodhub.order.dto.PlaceOrderRequest;
import com.foodhub.order.dto.PlaceOrderResult;
import com.foodhub.restaurant.RestaurantService;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

/*
 * No @Transactional: an order is ONE MongoDB document, and a single-document write is atomic.
 * Order data is intentionally NOT cached (see your spec).
 */
@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private static final int MAX_PAGE_SIZE = 20;
    private static final int MAX_QUANTITY_PER_ITEM = 50;
    // Only these fields can be sorted on. (price/total are stored as strings by default,
    // so sorting by totalAmount would be alphabetical, not numeric.)
    private static final Set<String> SORTABLE_FIELDS = Set.of("createdAt", "status");
    // 8-64 chars: letters, digits, "-" and "_". A UUID fits. Also keeps weird input out of the DB and logs.
    private static final Pattern IDEMPOTENCY_KEY_PATTERN = Pattern.compile("^[A-Za-z0-9_-]{8,64}$");

    private final OrderRepository orderRepository;
    private final MenuRepository menuRepository;
    private final RestaurantService restaurantService;

    public OrderService(OrderRepository orderRepository, MenuRepository menuRepository,
                        RestaurantService restaurantService) {
        this.orderRepository = orderRepository;
        this.menuRepository = menuRepository;
        this.restaurantService = restaurantService;
    }

    // ---------------------------------------------------------------- place order

    public PlaceOrderResult placeOrder(Long customerId, String idempotencyKey, PlaceOrderRequest request) {
        String key = validateIdempotencyKey(idempotencyKey);

        // 1. Replay? Same customer + same key = same order, no new document.
        Optional<Order> existing = orderRepository.findByCustomerIdAndIdempotencyKey(customerId, key);
        if (existing.isPresent()) {
            log.info("Idempotent replay: returning existing order {} for customerId={}",
                    existing.get().getId(), customerId);
            return new PlaceOrderResult(OrderResponse.from(existing.get()), false);
        }

        // 2. Restaurant must exist (MySQL)
        if (!restaurantService.exists(request.restaurantId())) {
            throw new ResourceNotFoundException("Restaurant not found");
        }

        // 3. Read the menu straight from MongoDB (not the cache): prices must be current
        Menu menu = menuRepository.findByRestaurantId(request.restaurantId())
                .orElseThrow(() -> new InvalidOrderException("This restaurant has no menu items yet"));
        Map<String, MenuItem> menuItemsById = menu.getItems().stream()
                .collect(Collectors.toMap(MenuItem::getItemId, Function.identity()));

        // 4. Merge repeated lines for the same item (itemId A x2 + itemId A x3 = A x5)
        Map<String, Integer> quantities = new LinkedHashMap<>();
        for (OrderItemRequest line : request.items()) {
            quantities.merge(line.itemId(), line.quantity(), Integer::sum);
        }

        // 5. Validate each line and price it using the DATABASE price
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;
        for (Map.Entry<String, Integer> line : quantities.entrySet()) {
            MenuItem menuItem = menuItemsById.get(line.getKey());
            if (menuItem == null) {
                throw new InvalidOrderException("One or more items do not belong to this restaurant");
            }
            if (!Boolean.TRUE.equals(menuItem.getAvailable())) {
                throw new InvalidOrderException("Food item is unavailable: " + menuItem.getName());
            }
            int quantity = line.getValue();
            if (quantity > MAX_QUANTITY_PER_ITEM) {
                throw new InvalidOrderException(
                        "Quantity must be at most " + MAX_QUANTITY_PER_ITEM + " per item");
            }
            orderItems.add(new OrderItem(menuItem.getItemId(), menuItem.getName(),
                    menuItem.getPrice(), quantity));
            total = total.add(menuItem.getPrice().multiply(BigDecimal.valueOf(quantity)));
        }

        // 6. Save. The unique index decides the winner if two identical requests race.
        Order order = new Order(customerId, request.restaurantId(), orderItems, total, key);
        try {
            Order saved = orderRepository.save(order);
            log.info("Order placed: orderId={}, customerId={}, restaurantId={}, total={}",
                    saved.getId(), customerId, saved.getRestaurantId(), saved.getTotalAmount());
            return new PlaceOrderResult(OrderResponse.from(saved), true);
        } catch (DuplicateKeyException ex) {
            log.warn("Concurrent duplicate order submission detected for customerId={}", customerId);
            return orderRepository.findByCustomerIdAndIdempotencyKey(customerId, key)
                    .map(winner -> new PlaceOrderResult(OrderResponse.from(winner), false))
                    .orElseThrow(() -> new ConflictException("Duplicate order submission. Please retry"));
        }
    }

    // ---------------------------------------------------------------- customer: my orders

    public List<OrderResponse> getMyOrders(Long customerId) {
        // The customer ID comes from the JWT principal, so nobody can ask for another customer's orders
        return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(OrderResponse::from)
                .toList();
    }

    // ---------------------------------------------------------------- owner: restaurant orders

    public PageResponse<OrderResponse> getRestaurantOrders(Long ownerId, int page, int size, String sort) {
        if (page < 0) {
            throw new InvalidRequestException("page must be 0 or greater");
        }
        if (size < 1) {
            throw new InvalidRequestException("size must be at least 1");
        }
        int effectiveSize = Math.min(size, MAX_PAGE_SIZE);

        // The restaurant is found from the owner's identity. An owner can never pass another restaurant ID.
        Long restaurantId = restaurantService.getMine(ownerId).id();

        Pageable pageable = PageRequest.of(page, effectiveSize, parseSort(sort));
        Page<OrderResponse> result = orderRepository.findByRestaurantId(restaurantId, pageable)
                .map(OrderResponse::from);
        return PageResponse.from(result);
    }

    // ---------------------------------------------------------------- owner: update status

    public OrderResponse updateStatus(Long ownerId, String orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Ownership check: is this order's restaurant owned by the caller? (404 / 403 from Milestone 3)
        restaurantService.verifyOwnership(ownerId, order.getRestaurantId());

        OrderStatus current = order.getStatus();
        if (!current.canTransitionTo(newStatus)) {
            log.warn("Invalid status transition for orderId={}: {} -> {}", orderId, current, newStatus);
            String allowed = current.allowedNext().isEmpty()
                    ? "none (this is a final status)"
                    : current.allowedNext().toString();
            throw new InvalidOrderStatusException(
                    "Cannot change status from " + current + " to " + newStatus + ". Allowed: " + allowed);
        }

        order.setStatus(newStatus);
        Order saved = orderRepository.save(order); // @Version rejects a stale concurrent save (409)

        log.info("Order status changed: orderId={}, {} -> {}, ownerId={}", orderId, current, newStatus, ownerId);
        return OrderResponse.from(saved);
    }

    // ---------------------------------------------------------------- helpers

    private String validateIdempotencyKey(String key) {
        if (key == null || !IDEMPOTENCY_KEY_PATTERN.matcher(key.trim()).matches()) {
            throw new InvalidRequestException(
                    "Idempotency-Key must be 8-64 characters: letters, digits, '-' or '_' (a UUID works)");
        }
        return key.trim();
    }

    // "createdAt,desc" -> Sort. Only whitelisted fields are accepted.
    private Sort parseSort(String sort) {
        String[] parts = sort.split(",");
        String field = parts[0].trim();
        if (!SORTABLE_FIELDS.contains(field)) {
            throw new InvalidRequestException("Cannot sort by '" + field + "'. Allowed: " + SORTABLE_FIELDS);
        }
        Sort.Direction direction = Sort.Direction.DESC;
        if (parts.length > 1) {
            direction = switch (parts[1].trim().toLowerCase()) {
                case "asc" -> Sort.Direction.ASC;
                case "desc" -> Sort.Direction.DESC;
                default -> throw new InvalidRequestException("Sort direction must be 'asc' or 'desc'");
            };
        }
        // Tie-breaker on id keeps page boundaries stable when many orders share the same value
        return Sort.by(direction, field).and(Sort.by(Sort.Direction.DESC, "id"));
    }
}