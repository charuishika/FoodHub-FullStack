package com.foodhub.auth.dto;

import com.foodhub.user.Role;
import com.foodhub.user.User;
import java.time.Instant;

// No password field here, so the hash can never leak.
public record UserResponse(Long id, String name, String email, Role role, String timeZone, Instant createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(),
                user.getRole(), user.getTimeZone(), user.getCreatedAt());
    }
}