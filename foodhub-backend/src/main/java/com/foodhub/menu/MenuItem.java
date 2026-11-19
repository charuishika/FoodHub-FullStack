package com.foodhub.menu;

import java.math.BigDecimal;

// Embedded inside Menu: no @Document, no collection of its own
public class MenuItem {

    private String itemId;
    private String name;
    private String description;
    private BigDecimal price;
    private Boolean available;
    private String imageUrl;

    // Needed by Spring Data to rebuild the object when reading from MongoDB
    public MenuItem() {
    }

    public MenuItem(String itemId, String name, String description, BigDecimal price,
                    Boolean available, String imageUrl) {
        this.itemId = itemId;
        this.name = name;
        this.description = description;
        this.price = price;
        this.available = available;
        this.imageUrl = imageUrl;
    }

    public String getItemId() { return itemId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}