package com.foodhub.menu;

import com.foodhub.common.ConflictException;
import com.foodhub.common.ResourceNotFoundException;
import com.foodhub.config.CacheConfig;
import com.foodhub.menu.dto.MenuItemRequest;
import com.foodhub.menu.dto.MenuItemResponse;
import com.foodhub.menu.dto.MenuResponse;
import com.foodhub.restaurant.RestaurantService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;

/*
 * No @Transactional here: MongoDB multi-document transactions need a replica set,
 * and every change below touches ONE document, which MongoDB already updates atomically.
 *
 * Caching works through a proxy: the @Cacheable / @CacheEvict annotations only apply when
 * another class (the controller) calls these methods. A method calling another method of
 * this same class would skip the cache. We never do that.
 */
@Service
public class MenuService {

    private static final Logger log = LoggerFactory.getLogger(MenuService.class);

    private final MenuRepository menuRepository;
    private final RestaurantService restaurantService;

    public MenuService(MenuRepository menuRepository, RestaurantService restaurantService) {
        this.menuRepository = menuRepository;
        this.restaurantService = restaurantService;
    }

    // On a cache hit this method body is skipped entirely (no MySQL, no MongoDB).
    // The debug line below therefore appears only on a cache miss.
    @Cacheable(value = CacheConfig.RESTAURANT_MENUS, key = "#restaurantId")
    public MenuResponse getMenu(Long restaurantId) {
        if (!restaurantService.exists(restaurantId)) {
            throw new ResourceNotFoundException("Restaurant not found");
        }
        log.debug("Cache miss: loading menu for restaurantId={} from MongoDB", restaurantId);
        return menuRepository.findByRestaurantId(restaurantId)
                .map(MenuResponse::from)
                .orElseGet(() -> new MenuResponse(restaurantId, List.of()));
    }

    // @CacheEvict runs AFTER the method returns normally (beforeInvocation defaults to false),
    // so a failed ownership check or a failed save never clears the cache.
    @CacheEvict(value = CacheConfig.RESTAURANT_MENUS, key = "#restaurantId")
    public MenuItemResponse addItem(Long ownerId, Long restaurantId, MenuItemRequest request) {
        restaurantService.verifyOwnership(ownerId, restaurantId);

        Menu menu = menuRepository.findByRestaurantId(restaurantId)
                .orElseGet(() -> new Menu(restaurantId)); // first item creates the menu document

        MenuItem item = new MenuItem(
                UUID.randomUUID().toString(),
                request.name().trim(),
                request.description(),
                normalizePrice(request.price()),
                true,
                cleanUrl(request.imageUrl()));
        menu.getItems().add(item);
        save(menu);

        log.info("Menu item added: restaurantId={}, itemId={}, ownerId={}", restaurantId, item.getItemId(), ownerId);
        return MenuItemResponse.from(item);
    }

    @CacheEvict(value = CacheConfig.RESTAURANT_MENUS, key = "#restaurantId")
    public MenuItemResponse updateItem(Long ownerId, Long restaurantId, String itemId, MenuItemRequest request) {
        restaurantService.verifyOwnership(ownerId, restaurantId);

        Menu menu = getMenuOrThrow(restaurantId);
        MenuItem item = findItemOrThrow(menu, itemId);
        String newName = request.name().trim();
        boolean nameChanged = !newName.equalsIgnoreCase(item.getName());
        item.setName(request.name().trim());
        item.setDescription(request.description());
        item.setPrice(normalizePrice(request.price()));
        item.setImageUrl(cleanUrl(request.imageUrl()));
        save(menu);

        log.info("Menu item updated: restaurantId={}, itemId={}, ownerId={}", restaurantId, itemId, ownerId);
        return MenuItemResponse.from(item);
    }

    @CacheEvict(value = CacheConfig.RESTAURANT_MENUS, key = "#restaurantId")
    public void deleteItem(Long ownerId, Long restaurantId, String itemId) {
        restaurantService.verifyOwnership(ownerId, restaurantId);

        Menu menu = getMenuOrThrow(restaurantId);
        boolean removed = menu.getItems().removeIf(item -> item.getItemId().equals(itemId));
        if (!removed) {
            throw new ResourceNotFoundException("Menu item not found");
        }
        save(menu);

        log.info("Menu item deleted: restaurantId={}, itemId={}, ownerId={}", restaurantId, itemId, ownerId);
    }

    @CacheEvict(value = CacheConfig.RESTAURANT_MENUS, key = "#restaurantId")
    public MenuItemResponse updateAvailability(Long ownerId, Long restaurantId, String itemId, boolean available) {
        restaurantService.verifyOwnership(ownerId, restaurantId);

        Menu menu = getMenuOrThrow(restaurantId);
        MenuItem item = findItemOrThrow(menu, itemId);
        item.setAvailable(available);
        save(menu);

        log.info("Menu item availability changed: restaurantId={}, itemId={}, available={}, ownerId={}",
                restaurantId, itemId, available, ownerId);
        return MenuItemResponse.from(item);
    }

    private Menu getMenuOrThrow(Long restaurantId) {
        return menuRepository.findByRestaurantId(restaurantId)
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
    }

    private MenuItem findItemOrThrow(Menu menu, String itemId) {
        return menu.getItems().stream()
                .filter(item -> item.getItemId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
    }

    // 10 -> 10.00, so prices always have two decimals
    private BigDecimal normalizePrice(BigDecimal price) {
        return price.setScale(2, RoundingMode.HALF_UP);
    }

    private void save(Menu menu) {
        try {
            menuRepository.save(menu);
        } catch (OptimisticLockingFailureException | DuplicateKeyException ex) {
            // Stale @Version, or two first-ever items racing to create the same menu document
            log.warn("Concurrent menu modification for restaurantId={}", menu.getRestaurantId());
            throw new ConflictException("The menu was modified at the same time. Please retry");
        }
    }
    
    private String cleanUrl(String url) {
        return (url == null || url.isBlank()) ? null : url.trim();
    }
}