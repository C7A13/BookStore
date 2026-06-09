package com.project.BookStore.Order.DTO.Response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookImage;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;
}
