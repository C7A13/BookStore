package com.project.BookStore.Cart.Repository;

import com.project.BookStore.Cart.Entity.CartItem;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    Optional<CartItem> findByCartIdAndBookId(Long cartId, Long bookId);

    @Query("""
        SELECT ci FROM CartItem ci
        LEFT JOIN FETCH ci.book
        WHERE ci.cart.id = :cartId
    """)
    List<CartItem> findAllByCartId(@Param("cartId") Long cartId);

    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.id IN :ids")
    void deleteAllByIdIn(List<Long> ids);
}
