package com.foodhub.menu;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface MenuRepository extends MongoRepository<Menu, String> {

    Optional<Menu> findByRestaurantId(Long restaurantId);
}