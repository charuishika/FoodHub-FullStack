package com.foodhub.menu.dto;

import jakarta.validation.constraints.NotNull;

public record AvailabilityRequest(
        @NotNull(message = "available is required (true or false)")
        Boolean available
) {
}