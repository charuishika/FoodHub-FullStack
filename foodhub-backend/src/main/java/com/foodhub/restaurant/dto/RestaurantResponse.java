package com.foodhub.restaurant.dto;

import com.foodhub.restaurant.Restaurant;
import java.time.Instant;

public record RestaurantResponse(Long id, String name, String description, String location,
                                 String imageUrl, Long ownerId, String ownerName, Instant createdAt) {

    public static RestaurantResponse from(Restaurant restaurant) {
        return new RestaurantResponse(
                restaurant.getId(),
                restaurant.getName(),
                restaurant.getDescription(),
                restaurant.getLocation(),
                restaurant.getImageUrl(),
                restaurant.getOwner().getId(),
                restaurant.getOwner().getName(),
                restaurant.getCreatedAt());
    }
}