package com.foodhub.order;

import java.util.EnumSet;
import java.util.Set;

public enum OrderStatus {
    PLACED, ACCEPTED, REJECTED, PREPARING, READY;


    public Set<OrderStatus> allowedNext() {
        return switch (this) {
            case PLACED -> EnumSet.of(ACCEPTED, REJECTED);
            case ACCEPTED -> EnumSet.of(PREPARING);
            case PREPARING -> EnumSet.of(READY);
            case REJECTED, READY -> EnumSet.noneOf(OrderStatus.class); 
        };
    }

    public boolean canTransitionTo(OrderStatus next) {
        return allowedNext().contains(next);
    }
}