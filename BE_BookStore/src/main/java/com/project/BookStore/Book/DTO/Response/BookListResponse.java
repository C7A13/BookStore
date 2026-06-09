package com.project.BookStore.Book.DTO.Response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookListResponse {
    private Long    id;
    private String  title;
    private String  slug;
    private String  coverImage;
    private BigDecimal    price;
    private BigDecimal    salePrice;
    private Integer discountPercent;
    private BigDecimal   effectivePrice;
    private Boolean isOnSale;
    private Integer stockQuantity;
    private Double  avgRating;
    private String  isbn;
    private String  categoryName;
    private String  authorName;
    private Boolean isActive;
}
