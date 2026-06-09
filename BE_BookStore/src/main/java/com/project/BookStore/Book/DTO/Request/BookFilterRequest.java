package com.project.BookStore.Book.DTO.Request;

import lombok.Data;

@Data
public class BookFilterRequest {
    private Long    categoryId;
    private Long    publisherId;
    private Long    authorId;
    private Long    minPrice;
    private Long    maxPrice;
    private String  language;
    private Boolean onSaleOnly;
    private Boolean inStockOnly;
    private String  keyword;
    private Boolean includeInactive;
    private Boolean isActive;
    private Boolean lowStockOnly;
}


