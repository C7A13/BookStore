package com.project.BookStore.Book.DTO.Request;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class BookCreateRequest {

    @NotBlank(message = "Book title cannot be empty")
    @Size(max = 300)
    private String title;

    @Size(max = 20)
    private String isbn;

    private String description;
    private String coverImage;

    @NotNull(message = "Selling price is required")
    @Min(value = 1000, message = "Minimum selling price is 1,000 VNĐ")
    private BigDecimal price;

    private BigDecimal costPrice;

    @Min(value = 0)
    private Integer stockQuantity = 0;

    private Integer reorderPoint = 5;
    private Integer weightGram;
    private Short   pageCount;
    private String  language = "vi";
    private Short   yearPublished;
    private Long    categoryId;
    private Long    publisherId;

    // Danh sách tác giả kèm vai trò
    private List<BookAuthorRequest> authors;

    @Data
    public static class BookAuthorRequest {
        @NotNull
        private Long   authorId;
        private String role = "author";
    }
}