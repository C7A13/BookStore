package com.project.BookStore.Cart.Controller;

import com.project.BookStore.Cart.DTO.Request.CartItemRequest;
import com.project.BookStore.Cart.DTO.Response.CartResponse;
import com.project.BookStore.Cart.Service.CartService;
import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Common.Utils.CookieUtils;
import com.project.BookStore.Auth.Security.UserContextService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartController {

    CartService cartService;
    CookieUtils cookieUtils;
    UserContextService userContextService;

    @GetMapping
    public ApiResponse<CartResponse> getCart(
            @CookieValue(value = "cart_session", required = false) String sessionToken,
            HttpServletResponse response) {

        sessionToken = resolveSessionToken(sessionToken, response);
        return ApiResponse.success(
                cartService.getCart(sessionToken),
                "Get cart successfully");
    }

    @PostMapping("/items")
    public ApiResponse<CartResponse> addToCart(
            @Valid @RequestBody CartItemRequest request,
            @CookieValue(value = "cart_session", required = false) String sessionToken,
            HttpServletResponse response) {

        sessionToken = resolveSessionToken(sessionToken, response);
        return ApiResponse.success(
                cartService.addToCart(request, sessionToken),
                "Add item to cart successfully");
    }

    @PutMapping("/items/{itemId}")
    public ApiResponse<CartResponse> updateQuantity(
            @PathVariable Long itemId,
            @RequestParam Integer quantity) {
        return ApiResponse.success(
                cartService.updateQuantity(itemId, quantity),
                "Update quantity successfully");
    }

    @DeleteMapping("/items/{itemId}")
    public ApiResponse<Void> removeItem(@PathVariable Long itemId) {
        cartService.removeItem(itemId);
        return ApiResponse.success("Remove item successfully");
    }

    @PostMapping("/merge")
    public ApiResponse<CartResponse> mergeCart(
            @CookieValue(value = "cart_session", required = false) String sessionToken,
            HttpServletResponse response) {

        if (sessionToken == null) {
            return ApiResponse.success(cartService.getCart(null), "No guest cart to merge");
        }

        CartResponse result = cartService.mergeCart(sessionToken);
        cookieUtils.clearCartSessionCookie(response);
        return ApiResponse.success(result, "Merge cart successfully");
    }

    @DeleteMapping("/clear")
    public ApiResponse<Void> clearCart(
            @CookieValue(value = "cart_session", required = false) String sessionToken) {
        cartService.clearCart(sessionToken);
        return ApiResponse.success("Clear cart successfully");
    }

    private String resolveSessionToken(String sessionToken, HttpServletResponse response) {
        if (userContextService.getCurrentUserId() != null) {
            return sessionToken;
        }
        if (sessionToken == null) {
            sessionToken = UUID.randomUUID().toString();
            cookieUtils.addCartSessionCookie(response, sessionToken);
        }
        return sessionToken;
    }
}
