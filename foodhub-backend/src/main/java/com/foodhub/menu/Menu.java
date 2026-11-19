package com.foodhub.menu;

import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "menus")
public class Menu {

    @Id
    private String id;

    // Plain Long, not a SQL foreign key: MySQL and MongoDB are separate databases.
    // Unique index = one menu document per restaurant.
    @Indexed(unique = true)
    private Long restaurantId;

    private List<MenuItem> items = new ArrayList<>();

    // Optimistic locking: Spring Data bumps this on every save and rejects a save
    // made from a stale copy (OptimisticLockingFailureException).
    @Version
    private Long version;

    public Menu() {
    }

    public Menu(Long restaurantId) {
        this.restaurantId = restaurantId;
    }

    public String getId() { return id; }
    public Long getRestaurantId() { return restaurantId; }
    public List<MenuItem> getItems() { return items; }
}