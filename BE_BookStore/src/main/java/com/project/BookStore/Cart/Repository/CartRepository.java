package com.project.BookStore.Cart.Repository;

import com.project.BookStore.Cart.Entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUserId(Long userId);

    Optional<Cart> findBySessionToken(String sessionToken);
    @Query("""
        SELECT c FROM Cart c
        LEFT JOIN FETCH c.cartItems ci
        LEFT JOIN FETCH ci.book
        WHERE c.user.id = :userId
    """)
    Optional<Cart> findByUserIdWithItems(@Param("userId") Long userId);

    @Query("""
        SELECT c FROM Cart c
        LEFT JOIN FETCH c.cartItems ci
        LEFT JOIN FETCH ci.book
        WHERE c.id = :cartId
    """)
    Optional<Cart> findCartWithItems(@Param("cartId") Long cartId);

    @Query("""
        SELECT c FROM Cart c
        LEFT JOIN FETCH c.cartItems ci
        LEFT JOIN FETCH ci.book
        WHERE c.sessionToken = :sessionToken
    """)
    Optional<Cart> findBySessionTokenWithItems(@Param("sessionToken") String sessionToken);

}
