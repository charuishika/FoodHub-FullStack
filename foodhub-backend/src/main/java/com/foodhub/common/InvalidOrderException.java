package com.foodhub.common;

// HTTP 400: the order content is not acceptable (unavailable item, wrong restaurant...)
public class InvalidOrderException extends RuntimeException {
    public InvalidOrderException(String message) {
        super(message);
    }
}