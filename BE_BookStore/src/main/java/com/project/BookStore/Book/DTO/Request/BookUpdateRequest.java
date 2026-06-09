package com.project.BookStore.Book.DTO.Request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class BookUpdateRequest {

    @Size(max = 20)
    private String isbn;

    @Size(max = 300)
    private String title;

    private String description;
    private String coverImage;

    @Min(value = 1000)
    private BigDecimal price;
    private BigDecimal   costPrice;
    private Integer weightGram;
    private Short   pageCount;
    private String  language;
    private Short   yearPublished;
    private Long    categoryId;
    private Long    publisherId;
    private Boolean isActive;
    
    @Min(value = 0)
    private Integer stockQuantity;
    
    private Integer reorderPoint;

    private List<BookAuthorRequest> authors;

    @Data
    public static class BookAuthorRequest {
        private Long   authorId;
        private String role = "author";
    }
}