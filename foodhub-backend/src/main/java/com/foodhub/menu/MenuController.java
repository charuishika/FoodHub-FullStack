package com.foodhub.menu;

import com.foodhub.menu.dto.AvailabilityRequest;
import com.foodhub.menu.dto.MenuItemRequest;
import com.foodhub.menu.dto.MenuItemResponse;
import com.foodhub.menu.dto.MenuResponse;
import com.foodhub.security.CustomUserDetails;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/restaurants/{restaurantId}/menu")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping
    public ResponseEntity<MenuResponse> getMenu(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(menuService.getMenu(restaurantId));
    }

    @PostMapping("/items")
    public ResponseEntity<MenuItemResponse> addItem(@AuthenticationPrincipal CustomUserDetails principal,
                                                    @PathVariable Long restaurantId,
                                                    @Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(menuService.addItem(principal.getId(), restaurantId, request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<MenuItemResponse> updateItem(@AuthenticationPrincipal CustomUserDetails principal,
                                                       @PathVariable Long restaurantId,
                                                       @PathVariable String itemId,
                                                       @Valid @RequestBody MenuItemRequest request) {
        return ResponseEntity.ok(menuService.updateItem(principal.getId(), restaurantId, itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> deleteItem(@AuthenticationPrincipal CustomUserDetails principal,
                                           @PathVariable Long restaurantId,
                                           @PathVariable String itemId) {
        menuService.deleteItem(principal.getId(), restaurantId, itemId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/items/{itemId}/availability")
    public ResponseEntity<MenuItemResponse> updateAvailability(@AuthenticationPrincipal CustomUserDetails principal,
                                                               @PathVariable Long restaurantId,
                                                               @PathVariable String itemId,
                                                               @Valid @RequestBody AvailabilityRequest request) {
        return ResponseEntity.ok(menuService.updateAvailability(
                principal.getId(), restaurantId, itemId, request.available()));
    }
}