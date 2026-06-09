package com.project.BookStore.Book.DTO.Response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor  // Thêm dòng này để tạo constructor không tham số public
@AllArgsConstructor
public class BookDetailResponse {
    private Long id;
    private String isbn;
    private String title;
    private String slug;
    private String description;
    private String coverImage;
    private BigDecimal price;
    private BigDecimal salePrice;
    private Integer discountPercent;
    private BigDecimal effectivePrice;
    private Boolean isOnSale;
    private LocalDateTime saleFrom;
    private LocalDateTime saleTo;
    private Integer stockQuantity;
    private Integer reorderPoint;
    private Integer weightGram;
    private Short pageCount;
    private String language;
    private Short yearPublished;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private CategoryInfo category;
    private PublisherInfo publisher;
    private List<AuthorInfo> authors;
    private List<BookImageInfo> images;

    private Double avgRating;
    private Integer reviewCount;

    @Data
    @Builder
    public static class CategoryInfo {
        private Long id;
        private String name;
        private String slug;
    }

    @Data
    @Builder
    public static class PublisherInfo {
        private Long id;
        private String name;
    }

    @Data
    @Builder
    public static class AuthorInfo {
        private Long id;
        private String fullName;
        private String slug;
        private String role;
    }

    @Data
    @Builder
    public static class BookImageInfo {
        private Long id;
        private String url;
        private String altText;
        private Short sortOrder;
    }
}
