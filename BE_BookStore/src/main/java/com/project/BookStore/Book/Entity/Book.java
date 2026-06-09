package com.project.BookStore.Book.Entity;

import com.project.BookStore.Book.Entity.BookAuthor;
import com.project.BookStore.Book.Entity.BookImage;
import com.project.BookStore.Catetory.Entity.Category;
import com.project.BookStore.Common.Entity.BaseEntity;
import com.project.BookStore.Publisher.Entity.Publisher;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLRestriction("deleted_at IS NULL")
public class Book extends BaseEntity {

    @Column(unique = true)
    private String isbn;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false, unique = true, length = 320)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "cover_image", length = 500)
    private String coverImage;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "cost_price")
    private BigDecimal costPrice;

    @Column(name = "sale_price")
    private BigDecimal salePrice;

    @Column(name = "sale_from")
    private LocalDateTime saleFrom;

    @Column(name = "sale_to")
    private LocalDateTime saleTo;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity = 0;

    @Column(name = "reorder_point", nullable = false)
    private Integer reorderPoint = 5;

    @Column(name = "weight_gram")
    private Integer weightGram;

    @Column(name = "page_count")
    private Short pageCount;

    @Column(length = 5)
    private String language = "vi";

    @Column(name = "year_published")
    private Short yearPublished;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publisher_id")
    private Publisher publisher;

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private Set<BookImage> images = new LinkedHashSet<>();

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    @org.hibernate.annotations.BatchSize(size = 20)
    private Set<BookAuthor> bookAuthors = new LinkedHashSet<>();

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    public boolean isOnSale() {
        if (salePrice == null || saleFrom == null || saleTo == null) return false;
        LocalDateTime now = LocalDateTime.now();
        return now.isAfter(saleFrom) && now.isBefore(saleTo);
    }

    public BigDecimal getEffectivePrice() {
        if (isOnSale() && salePrice != null) {
            return salePrice;
        }
        return price;
    }
}
