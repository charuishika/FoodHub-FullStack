package com.foodhub.order.dto;

import com.foodhub.order.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateStatusRequest(
        @NotNull(message = "Status is required")
        OrderStatus status
) {
}