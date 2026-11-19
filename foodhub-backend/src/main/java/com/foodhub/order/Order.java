package com.foodhub.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "orders")
@CompoundIndexes({
        // THE idempotency guard: one order per (customer, key). The database enforces it,
        // so even two simultaneous requests cannot both succeed.
        @CompoundIndex(name = "customer_idempotency_idx",
                def = "{'customerId': 1, 'idempotencyKey': 1}", unique = true),
        // Speed up "my orders" and "restaurant orders (newest first)"
        @CompoundIndex(name = "customer_created_idx", def = "{'customerId': 1, 'createdAt': -1}"),
        @CompoundIndex(name = "restaurant_created_idx", def = "{'restaurantId': 1, 'createdAt': -1}")
})
public class Order {

    @Id
    private String id;

    // Plain IDs pointing into MySQL. No SQL foreign keys for MongoDB references.
    private Long customerId;
    private Long restaurantId;

    private List<OrderItem> items = new ArrayList<>();
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String idempotencyKey;

    // Stored by MongoDB as a BSON Date = a UTC instant. Truncated to milliseconds,
    // the precision MongoDB keeps, so a value read back equals the value returned at creation.
    private Instant createdAt;

    // Optimistic locking for concurrent status updates
    @Version
    private Long version;

    public Order() {
    }

    public Order(Long customerId, Long restaurantId, List<OrderItem> items,
                 BigDecimal totalAmount, String idempotencyKey) {
        this.customerId = customerId;
        this.restaurantId = restaurantId;
        this.items = items;
        this.totalAmount = totalAmount;
        this.status = OrderStatus.PLACED;
        this.idempotencyKey = idempotencyKey;
        this.createdAt = Instant.now().truncatedTo(ChronoUnit.MILLIS);
    }

    public String getId() { return id; }
    public Long getCustomerId() { return customerId; }
    public Long getRestaurantId() { return restaurantId; }
    public List<OrderItem> getItems() { return items; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public Instant getCreatedAt() { return createdAt; }
}