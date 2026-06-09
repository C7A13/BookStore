package com.project.BookStore.Cart.DTO.Response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private Long id;
    private Long userId;
    private String sessionToken;
    private List<CartItemResponse> items;
    private BigDecimal totalAmount;
}
