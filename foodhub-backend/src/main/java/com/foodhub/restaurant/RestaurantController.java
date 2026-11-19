package com.foodhub.restaurant;

import com.foodhub.restaurant.dto.CreateRestaurantRequest;
import com.foodhub.restaurant.dto.RestaurantResponse;
import com.foodhub.security.CustomUserDetails;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;

    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    @PostMapping
    public ResponseEntity<RestaurantResponse> create(@AuthenticationPrincipal CustomUserDetails principal,
                                                     @Valid @RequestBody CreateRestaurantRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(restaurantService.create(principal.getId(), request));
    }

    @GetMapping
    public ResponseEntity<List<RestaurantResponse>> getAll() {
        return ResponseEntity.ok(restaurantService.getAll());
    }

    // Not in your spec: lets an owner find their own restaurant ID after logging in again.
    // Spring prefers this literal path over /{id}, so "my" is never treated as an ID.
    @GetMapping("/my")
    public ResponseEntity<RestaurantResponse> getMine(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(restaurantService.getMine(principal.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getById(id));
    }
}