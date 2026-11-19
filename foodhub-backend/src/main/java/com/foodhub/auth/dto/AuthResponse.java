package com.foodhub.auth.dto;

public record AuthResponse(String token, String tokenType, UserResponse user) {
}