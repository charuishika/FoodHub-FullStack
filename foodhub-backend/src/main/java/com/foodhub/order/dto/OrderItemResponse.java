package com.foodhub.order.dto;

import com.foodhub.order.OrderItem;
import java.math.BigDecimal;

public record OrderItemResponse(String itemId, String itemName, BigDecimal price,
                                Integer quantity, BigDecimal lineTotal) {

    public static OrderItemResponse from(OrderItem item) {
        return new OrderItemResponse(item.getItemId(), item.getItemName(), item.getPrice(),
                item.getQuantity(), item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
    }
}