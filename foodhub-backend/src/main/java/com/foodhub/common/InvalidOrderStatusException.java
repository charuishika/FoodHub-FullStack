package com.foodhub.common;

// HTTP 409: the status change conflicts with the order's current state
public class InvalidOrderStatusException extends RuntimeException {
    public InvalidOrderStatusException(String message) {
        super(message);
    }
}