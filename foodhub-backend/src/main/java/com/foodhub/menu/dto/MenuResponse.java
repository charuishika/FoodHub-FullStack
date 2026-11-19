package com.foodhub.menu.dto;

import com.foodhub.menu.Menu;
import java.util.List;

// Immutable (record + unmodifiable list), so it is safe to keep in a shared cache
public record MenuResponse(Long restaurantId, List<MenuItemResponse> items) {

    public static MenuResponse from(Menu menu) {
        return new MenuResponse(menu.getRestaurantId(),
                menu.getItems().stream().map(MenuItemResponse::from).toList());
    }
}