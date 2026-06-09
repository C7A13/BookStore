package com.project.BookStore.Cart.Service;

import com.project.BookStore.Cart.DTO.Request.CartItemRequest;
import com.project.BookStore.Cart.DTO.Response.CartResponse;

public interface CartService {
    CartResponse getCart(String sessionToken);
    CartResponse addToCart(CartItemRequest request, String sessionToken);
    CartResponse updateQuantity(Long cartItemId, Integer quantity);
    void removeItem(Long cartItemId);
    void clearCart(String sessionToken);
    CartResponse mergeCart(String sessionToken);
}
