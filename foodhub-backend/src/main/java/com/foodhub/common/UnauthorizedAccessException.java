package com.foodhub.common;

// Maps to HTTP 403: the user is logged in but may not touch this resource
public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException(String message) {
        super(message);
    }
}