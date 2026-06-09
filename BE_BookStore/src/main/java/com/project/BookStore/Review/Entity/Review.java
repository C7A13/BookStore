package com.project.BookStore.Review.Entity;

import com.project.BookStore.Book.Entity.Book;
import com.project.BookStore.Common.Entity.BaseEntity;
import com.project.BookStore.Order.Entity.Order;
import com.project.BookStore.User.Entity.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_review",
                columnNames = {"book_id", "user_id", "order_id"}
        ))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    Book book;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    Order order;

    @Column(name = "rating", nullable = false, columnDefinition = "TINYINT")
    private Integer rating;

    @Column(length = 200)
    String title;

    @Column(columnDefinition = "TEXT")
    String body;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    Boolean isVerified = true;

    @Column(name = "is_visible", nullable = false)
    @Builder.Default
    Boolean isVisible = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
}
