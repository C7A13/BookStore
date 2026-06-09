package com.project.BookStore.Order.Repository;

import com.project.BookStore.Order.Entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("""
        SELECT o FROM Order o
        LEFT JOIN FETCH o.orderItems oi
        LEFT JOIN FETCH oi.book
        LEFT JOIN FETCH o.user
        LEFT JOIN FETCH o.address
        WHERE o.id = :id
    """)
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    @Query("""
        SELECT o FROM Order o
        LEFT JOIN FETCH o.orderItems oi
        LEFT JOIN FETCH oi.book
        LEFT JOIN FETCH o.user
        LEFT JOIN FETCH o.address
        WHERE o.code = :code
    """)
    Optional<Order> findByCodeWithItems(@Param("code") String code);

    @Query("""
        SELECT DISTINCT o FROM Order o
        LEFT JOIN FETCH o.orderItems oi
        LEFT JOIN FETCH oi.book
        LEFT JOIN FETCH o.user
        LEFT JOIN FETCH o.address
        WHERE o.user.id = :userId
        ORDER BY o.createdAt DESC
    """)
    List<Order> findAllByUserIdWithItems(@Param("userId") Long userId);

    @Query("""
        SELECT DISTINCT o FROM Order o
        LEFT JOIN FETCH o.orderItems oi
        LEFT JOIN FETCH oi.book
        LEFT JOIN FETCH o.user
        LEFT JOIN FETCH o.address
        ORDER BY o.createdAt DESC
    """)
    List<Order> findAllWithItems();

    // Statistics Queries
    @Query("SELECT COUNT(o) FROM Order o")
    Long countTotalOrders();

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status = 'DELIVERED'")
    BigDecimal calculateTotalRevenue();

    @Query("SELECT COUNT(DISTINCT o.user.id) FROM Order o")
    Long countTotalCustomers();

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countOrdersByStatus();

    @Query("""
        SELECT DISTINCT o FROM Order o
        LEFT JOIN FETCH o.orderItems oi
        LEFT JOIN FETCH oi.book
        WHERE o.status = com.project.BookStore.Order.Enum.OrderStatus.PENDING
        AND o.paymentMethod = com.project.BookStore.Payment.Enum.PaymentMethod.VNPAY
        AND o.createdAt < :threshold
    """)
    List<Order> findExpiredVnpayOrders(@Param("threshold") java.time.LocalDateTime threshold);
}
