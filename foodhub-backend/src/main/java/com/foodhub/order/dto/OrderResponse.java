package com.foodhub.order.dto;

import com.foodhub.order.Order;
import com.foodhub.order.OrderStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

// createdAt is an Instant, serialized as ISO 8601 UTC (ends with Z).
// No timezone conversion happens in the backend. The frontend converts for display.
public record OrderResponse(String orderId, Long customerId, Long restaurantId,
                            List<OrderItemResponse> items, BigDecimal totalAmount,
                            OrderStatus status, Instant createdAt) {

    public static OrderResponse from(Order order) {
        return new OrderResponse(order.getId(), order.getCustomerId(), order.getRestaurantId(),
                order.getItems().stream().map(OrderItemResponse::from).toList(),
                order.getTotalAmount(), order.getStatus(), order.getCreatedAt());
    }
}