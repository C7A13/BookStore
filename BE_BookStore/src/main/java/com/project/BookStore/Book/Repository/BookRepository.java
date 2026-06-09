package com.project.BookStore.Book.Repository;

import com.project.BookStore.Book.DTO.Response.BookListResponse;
import com.project.BookStore.Common.Response.PageResponse;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.project.BookStore.Book.Entity.Book;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long>, BookRepositoryCustom {

    Optional<Book> findBySlugAndDeletedAtIsNull(String slug);

    Optional<Book> findByIdAndDeletedAtIsNull(Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Book b WHERE b.id = :id AND b.deletedAt IS NULL")
    Optional<Book> findByIdWithLock(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Book b SET b.stockQuantity = b.stockQuantity - :qty WHERE b.id = :id AND b.stockQuantity >= :qty")
    int decreaseStockIfAvailable(@Param("id") Long id, @Param("qty") int qty);

    @Modifying
    @Query("UPDATE Book b SET b.stockQuantity = b.stockQuantity + :qty WHERE b.id = :id")
    int increaseStock(@Param("id") Long id, @Param("qty") int qty);

    boolean existsByIsbnAndDeletedAtIsNull(String isbn);

    boolean existsBySlug(String slug);

    @Query("""
        SELECT b FROM Book b
        WHERE b.deletedAt IS NULL
          AND b.isActive = true
          AND b.salePrice IS NOT NULL
          AND :now BETWEEN b.saleFrom AND b.saleTo
        ORDER BY b.updatedAt DESC
        """)
    Page<Book> findOnSale(@Param("now") LocalDateTime now, Pageable pageable);


    @Query("""
        SELECT b FROM Book b
        WHERE b.deletedAt IS NULL
          AND b.isActive = true
          AND b.stockQuantity <= b.reorderPoint
        ORDER BY b.stockQuantity ASC
        """)
    List<Book> findLowStock();

    @Query("""
        SELECT b FROM Book b
        WHERE b.deletedAt IS NULL
          AND b.isActive = true
          AND b.stockQuantity <= b.reorderPoint
        ORDER BY b.stockQuantity ASC
        """)
    Page<Book> findLowStock(Pageable pageable);

    @Query("""
        SELECT b FROM Book b
        WHERE b.deletedAt IS NULL
          AND b.isActive = true
          AND b.category.id = :categoryId
          AND b.id != :excludeId
        ORDER BY b.createdAt DESC
        """)
    List<Book> findRelated(
            @Param("categoryId") Long categoryId,
            @Param("excludeId")  Long excludeId,
            org.springframework.data.domain.Pageable pageable
    );

//    @Query("""
//        SELECT b FROM Book b
//        JOIN order_items oi ON oi.book.id = b.id
//        JOIN oi.order o
//        WHERE b.deletedAt IS NULL
//          AND b.isActive = true
//          AND o.status = 'delivered'
//        GROUP BY b.id
//        ORDER BY SUM(oi.quantity) DESC
//        """)
//    List<Book> findBestsellers(
//            org.springframework.data.domain.Pageable pageable
//    );

    @Query("""
        SELECT DISTINCT b FROM Book b
        LEFT JOIN b.bookAuthors ba
        LEFT JOIN ba.author a
        LEFT JOIN b.publisher p
        WHERE b.deletedAt IS NULL
          AND b.isActive = true
          AND (
            LOWER(b.title)    LIKE LOWER(CONCAT('%', :kw, '%')) OR
            b.isbn            LIKE CONCAT('%', :kw, '%')        OR
            LOWER(a.fullName) LIKE LOWER(CONCAT('%', :kw, '%')) OR
            LOWER(p.name)     LIKE LOWER(CONCAT('%', :kw, '%'))
          )
        """)
    Page<Book> searchByKeyword(@Param("kw") String keyword, Pageable pageable);

    @Query("""
SELECT b FROM Book b
WHERE b.deletedAt IS NULL
AND b.isActive = true
AND b.category.id IN :ids
""")
    Page<Book> findPublicBooksByCategoryIds(
            @Param("ids") List<Long> ids,
            Pageable pageable
    );
    @Query("""
        SELECT b FROM Book b
        LEFT JOIN FETCH b.category
        LEFT JOIN FETCH b.publisher
        LEFT JOIN FETCH b.bookAuthors ba
        LEFT JOIN FETCH ba.author
        LEFT JOIN FETCH b.images
        WHERE b.slug = :slug AND b.isActive = true
    """)
    Optional<Book> findBySlugWithDetails(@Param("slug") String slug);

    @Query("""
        SELECT b FROM Book b
        LEFT JOIN FETCH b.category
        LEFT JOIN FETCH b.publisher
        LEFT JOIN FETCH b.bookAuthors ba
        LEFT JOIN FETCH ba.author
        LEFT JOIN FETCH b.images
        WHERE b.id = :id
    """)
    Optional<Book> findByIdWithDetails(@Param("id") Long id);
}
