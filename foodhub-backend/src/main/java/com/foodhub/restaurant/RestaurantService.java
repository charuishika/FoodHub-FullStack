package com.foodhub.restaurant;

import com.foodhub.common.ConflictException;
import com.foodhub.common.ResourceNotFoundException;
import com.foodhub.common.UnauthorizedAccessException;
import com.foodhub.restaurant.dto.CreateRestaurantRequest;
import com.foodhub.restaurant.dto.RestaurantResponse;
import com.foodhub.user.Role;
import com.foodhub.user.User;
import com.foodhub.user.UserRepository;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RestaurantService {

    private static final Logger log = LoggerFactory.getLogger(RestaurantService.class);

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    public RestaurantService(RestaurantRepository restaurantRepository, UserRepository userRepository) {
        this.restaurantRepository = restaurantRepository;
        this.userRepository = userRepository;
    }
    @Transactional
    public RestaurantResponse create(Long ownerId, CreateRestaurantRequest request) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        
        if (owner.getRole() != Role.OWNER) {
            throw new UnauthorizedAccessException("Only restaurant owners can create a restaurant");
        }

        if (restaurantRepository.existsByOwnerId(ownerId)) {
            throw new ConflictException("You already have a restaurant. Only one is allowed per owner");
        }

        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.name().trim());
        restaurant.setDescription(request.description());
        restaurant.setLocation(request.location());
        restaurant.setOwner(owner);
        restaurant.setImageUrl(cleanUrl(request.imageUrl()));

        Restaurant saved;
        try {
            // saveAndFlush sends the INSERT now, so a unique violation is thrown inside this try block
            saved = restaurantRepository.saveAndFlush(restaurant);
        } catch (DataIntegrityViolationException ex) {
            // Two simultaneous requests: the unique constraint on owner_id is the final guard
            throw new ConflictException("You already have a restaurant. Only one is allowed per owner");
        }

        log.info("Restaurant created: id={}, ownerId={}", saved.getId(), ownerId);
        return RestaurantResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<RestaurantResponse> getAll() {
        return restaurantRepository.findAllWithOwner().stream()
                .map(RestaurantResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public RestaurantResponse getById(Long id) {
        return RestaurantResponse.from(findOrThrow(id));
    }

    @Transactional(readOnly = true)
    public RestaurantResponse getMine(Long ownerId) {
        return restaurantRepository.findByOwnerIdWithOwner(ownerId)
                .map(RestaurantResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("You have not created a restaurant yet"));
    }

    
    @Transactional(readOnly = true)
    public void verifyOwnership(Long ownerId, Long restaurantId) {
        Restaurant restaurant = findOrThrow(restaurantId);
        if (!restaurant.getOwner().getId().equals(ownerId)) {
            log.warn("Ownership check failed: userId={} tried to access restaurantId={}", ownerId, restaurantId);
            throw new UnauthorizedAccessException("You do not own this restaurant");
        }
    }

    @Transactional(readOnly = true)
    public boolean exists(Long restaurantId) {
        return restaurantRepository.existsById(restaurantId);
    }

    private Restaurant findOrThrow(Long id) {
        return restaurantRepository.findByIdWithOwner(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant not found"));
    }
    
    
    private String cleanUrl(String url) {
        return (url == null || url.isBlank()) ? null : url.trim();
    }
}