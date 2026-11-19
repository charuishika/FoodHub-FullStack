package com.foodhub.order.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

// Only the item ID and quantity. Price and name are never accepted from the client.
public record OrderItemRequest(
        @NotBlank(message = "Item ID is required")
        String itemId,

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be greater than zero")
        @Max(value = 50, message = "Quantity must be at most 50 per item")
        Integer quantity
) {
}