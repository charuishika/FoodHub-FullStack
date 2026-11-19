package com.foodhub.menu.dto;

import com.foodhub.menu.MenuItem;
import java.math.BigDecimal;

public record MenuItemResponse(String itemId, String name, String description,
                               BigDecimal price, Boolean available, String imageUrl) {

    public static MenuItemResponse from(MenuItem item) {
        return new MenuItemResponse(item.getItemId(), item.getName(), item.getDescription(),
                item.getPrice(), item.getAvailable(), item.getImageUrl());
    }
}