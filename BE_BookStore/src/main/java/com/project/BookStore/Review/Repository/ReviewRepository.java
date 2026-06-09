package com.project.BookStore.Review.Repository;

import com.project.BookStore.Review.Entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    @Override
    @EntityGraph(attributePaths = {"book", "user", "order"})
    Page<Review> findAll(Pageable pageable);

    // Public: chỉ lấy review visible
    @EntityGraph(attributePaths = {"book", "user", "order"})
    Page<Review> findByBookIdAndIsVisibleTrue(Long bookId, Pageable pageable);

    // Admin: lấy tất cả review (kể cả ẩn)
    @EntityGraph(attributePaths = {"book", "user", "order"})
    Page<Review> findByBookId(Long bookId, Pageable pageable);

    // Lấy review của user
    @EntityGraph(attributePaths = {"book", "user", "order"})
    Page<Review> findByUserId(Long userId, Pageable pageable);

    // Kiểm tra đã review chưa (UNIQUE constraint)
    boolean existsByBookIdAndUserIdAndOrderId(Long bookId, Long userId, Long orderId);

    // Đếm review visible cho 1 book
    long countByBookIdAndIsVisibleTrue(Long bookId);

    // Trung bình rating cho 1 book (chỉ visible)
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.book.id = :bookId AND r.isVisible = true")
    Double getAverageRatingByBookId(@Param("bookId") Long bookId);

    // Lấy review theo id (fetch user + book để tránh N+1)
    @Query("""
        SELECT r FROM Review r
        LEFT JOIN FETCH r.user
        LEFT JOIN FETCH r.book
        LEFT JOIN FETCH r.order
        WHERE r.id = :id
    """)
    Optional<Review> findByIdWithDetails(@Param("id") Long id);
}
