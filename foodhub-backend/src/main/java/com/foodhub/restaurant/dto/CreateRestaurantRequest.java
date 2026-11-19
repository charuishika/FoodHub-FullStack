package com.foodhub.restaurant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateRestaurantRequest(
        @NotBlank(message = "Restaurant name is required")
        @Size(max = 100, message = "Name must be at most 100 characters")
        String name,

        @Size(max = 500, message = "Description must be at most 500 characters")
        String description,

        @Size(max = 200, message = "Location must be at most 200 characters")
        String location,

        // Optional. Only http/https links are accepted, so values like "javascript:..." are rejected.
        @Size(max = 500, message = "Image link must be at most 500 characters")
        @Pattern(regexp = "(?i)^$|^https?://\\S+$", message = "Image link must start with http:// or https://")
        String imageUrl
) {
}