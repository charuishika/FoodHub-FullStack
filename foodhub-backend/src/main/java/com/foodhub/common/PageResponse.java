package com.foodhub.common;

import java.util.List;
import org.springframework.data.domain.Page;

// Matches the response format in your spec. We never return Spring's Page object directly,
// because its JSON shape is not guaranteed to stay stable.
public record PageResponse<T>(List<T> content, long totalElements, int totalPages, int number, int size) {

    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(page.getContent(), page.getTotalElements(),
                page.getTotalPages(), page.getNumber(), page.getSize());
    }
}