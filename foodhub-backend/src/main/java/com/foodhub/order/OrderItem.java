package com.foodhub.order;

import java.math.BigDecimal;

// Embedded in Order. A snapshot: name and price are copied from the menu at order time.
public class OrderItem {

    private String itemId;
    private String itemName;
    private BigDecimal price;
    private Integer quantity;

    public OrderItem() {
    }

    public OrderItem(String itemId, String itemName, BigDecimal price, Integer quantity) {
        this.itemId = itemId;
        this.itemName = itemName;
        this.price = price;
        this.quantity = quantity;
    }

    public String getItemId() { return itemId; }
    public String getItemName() { return itemName; }
    public BigDecimal getPrice() { return price; }
    public Integer getQuantity() { return quantity; }
}