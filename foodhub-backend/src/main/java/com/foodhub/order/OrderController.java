package com.foodhub.order;

import com.foodhub.common.PageResponse;
import com.foodhub.order.dto.OrderResponse;
import com.foodhub.order.dto.PlaceOrderRequest;
import com.foodhub.order.dto.PlaceOrderResult;
import com.foodhub.order.dto.UpdateStatusRequest;
import com.foodhub.security.CustomUserDetails;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Valid @RequestBody PlaceOrderRequest request) {

        PlaceOrderResult result = orderService.placeOrder(principal.getId(), idempotencyKey, request);
        // 201 = new order created, 200 = same request repeated, existing order returned
        HttpStatus status = result.created() ? HttpStatus.CREATED : HttpStatus.OK;
        return ResponseEntity.status(status).body(result.order());
    }

    @GetMapping("/my")
    public ResponseEntity<List<OrderResponse>> myOrders(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(orderService.getMyOrders(principal.getId()));
    }

    @GetMapping("/restaurant")
    public ResponseEntity<PageResponse<OrderResponse>> restaurantOrders(
            @AuthenticationPrincipal CustomUserDetails principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        return ResponseEntity.ok(orderService.getRestaurantOrders(principal.getId(), page, size, sort));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateStatus(
            @AuthenticationPrincipal CustomUserDetails principal,
            @PathVariable String orderId,
            @Valid @RequestBody UpdateStatusRequest request) {

        return ResponseEntity.ok(orderService.updateStatus(principal.getId(), orderId, request.status()));
    }
}