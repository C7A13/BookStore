package com.project.BookStore.Comment.Repository;

import com.project.BookStore.Comment.Entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Public: get visible top-level comments (parent is null) for a book, with user and book fetched to prevent N+1
    @Query(value = "SELECT c FROM Comment c " +
                   "LEFT JOIN FETCH c.user " +
                   "LEFT JOIN FETCH c.book " +
                   "WHERE c.book.id = :bookId AND c.parent IS NULL AND c.isVisible = true",
           countQuery = "SELECT COUNT(c) FROM Comment c WHERE c.book.id = :bookId AND c.parent IS NULL AND c.isVisible = true")
    Page<Comment> findByBookIdAndParentIsNullAndIsVisibleTrue(@Param("bookId") Long bookId, Pageable pageable);

    // Admin: get all top-level comments (including hidden ones) for a book, with user and book fetched
    @Query(value = "SELECT c FROM Comment c " +
                   "LEFT JOIN FETCH c.user " +
                   "LEFT JOIN FETCH c.book " +
                   "WHERE c.book.id = :bookId AND c.parent IS NULL",
           countQuery = "SELECT COUNT(c) FROM Comment c WHERE c.book.id = :bookId AND c.parent IS NULL")
    Page<Comment> findByBookIdAndParentIsNull(@Param("bookId") Long bookId, Pageable pageable);

    // Bulk fetch replies by their parent IDs to completely avoid N+1 queries
    @Query("SELECT c FROM Comment c " +
           "LEFT JOIN FETCH c.user " +
           "LEFT JOIN FETCH c.book " +
           "WHERE c.parent.id IN :parentIds " +
           "ORDER BY c.createdAt ASC")
    java.util.List<Comment> findRepliesByParentIds(@Param("parentIds") java.util.Collection<Long> parentIds);

    // Fetch comment with details to avoid N+1 queries
    @Query("""
        SELECT c FROM Comment c
        LEFT JOIN FETCH c.user
        LEFT JOIN FETCH c.book
        LEFT JOIN FETCH c.parent
        WHERE c.id = :id
    """)
    Optional<Comment> findByIdWithDetails(@Param("id") Long id);
}
