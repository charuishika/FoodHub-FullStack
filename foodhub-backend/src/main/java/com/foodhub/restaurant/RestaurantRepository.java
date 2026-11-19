package com.foodhub.restaurant;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    // Derived query: Spring reads "OwnerId" as owner.id
    boolean existsByOwnerId(Long ownerId);

    // "join fetch" loads the owner in the same SQL query (avoids N+1 queries)
    @Query("select r from Restaurant r join fetch r.owner order by r.createdAt desc")
    List<Restaurant> findAllWithOwner();

    @Query("select r from Restaurant r join fetch r.owner where r.id = :id")
    Optional<Restaurant> findByIdWithOwner(@Param("id") Long id);

    @Query("select r from Restaurant r join fetch r.owner where r.owner.id = :ownerId")
    Optional<Restaurant> findByOwnerIdWithOwner(@Param("ownerId") Long ownerId);
}