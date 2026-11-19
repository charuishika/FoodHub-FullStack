package com.foodhub.menu.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record MenuItemRequest(
        @NotBlank(message = "Food name is required")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,

        @Size(max = 500, message = "Description must be at most 500 characters")
        String description,

        @NotNull(message = "Price is required")
        @Positive(message = "Price must be greater than zero")
        @Digits(integer = 8, fraction = 2, message = "Price must have at most 8 digits and 2 decimals")
        BigDecimal price,

        @Size(max = 500, message = "Image link must be at most 500 characters")
        @Pattern(regexp = "(?i)^$|^https?://\\S+$", message = "Image link must start with http:// or https://")
        String imageUrl
) {
}