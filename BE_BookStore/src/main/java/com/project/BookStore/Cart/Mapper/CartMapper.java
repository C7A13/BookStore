package com.project.BookStore.Cart.Mapper;

import com.project.BookStore.Cart.DTO.Response.CartItemResponse;
import com.project.BookStore.Cart.DTO.Response.CartResponse;
import com.project.BookStore.Cart.Entity.Cart;
import com.project.BookStore.Cart.Entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "items", source = "cartItems")
    @Mapping(target = "totalAmount", expression = "java(calculateTotal(cart))")
    CartResponse toResponse(Cart cart);


    @Mapping(target = "bookId", source = "book.id")
    @Mapping(target = "bookTitle", source = "book.title")
    @Mapping(target = "bookSlug", source = "book.slug")
    @Mapping(target = "bookImage", source = "book.coverImage")
    @Mapping(target = "originalPrice", source = "book.price")
    @Mapping(target = "subtotal", expression = "java(calculateSubtotal(cartItem))")
    CartItemResponse toItemResponse(CartItem cartItem);

    List<CartItemResponse> toItemResponseList(List<CartItem> cartItems);

    default BigDecimal calculateSubtotal(CartItem cartItem) {
        if (cartItem.getUnitPrice() == null || cartItem.getQuantity() == null) return BigDecimal.ZERO;
        return cartItem.getUnitPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
    }

    default BigDecimal calculateTotal(Cart cart) {
        if (cart.getCartItems() == null) return BigDecimal.ZERO;
        return cart.getCartItems().stream()
                .map(this::calculateSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
