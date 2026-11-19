package com.foodhub.order;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OrderRepository extends MongoRepository<Order, String> {

    Optional<Order> findByCustomerIdAndIdempotencyKey(Long customerId, String idempotencyKey);

    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    // Pageable carries page number, size and sort; Spring Data runs skip/limit/count in MongoDB
    Page<Order> findByRestaurantId(Long restaurantId, Pageable pageable);
}