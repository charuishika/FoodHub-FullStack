package com.foodhub.order.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record PlaceOrderRequest(
        @NotNull(message = "Restaurant ID is required")
        Long restaurantId,

        @NotEmpty(message = "At least one item is required")
        @Size(max = 50, message = "An order can have at most 50 line items")
        @Valid // validate each OrderItemRequest inside the list
        List<OrderItemRequest> items
) {
}