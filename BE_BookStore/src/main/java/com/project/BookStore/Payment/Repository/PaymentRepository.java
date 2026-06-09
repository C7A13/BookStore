package com.project.BookStore.Payment.Repository;

import com.project.BookStore.Payment.Entity.Payment;
import com.project.BookStore.Payment.Enum.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    @Query("SELECT p FROM Payment p JOIN FETCH p.order o WHERE o.id = :orderId")
    Optional<Payment> findByOrderId(@Param("orderId") Long orderId);

    @Query("SELECT p FROM Payment p JOIN FETCH p.order o WHERE p.transactionRef = :ref")
    Optional<Payment> findByTransactionRef(@Param("ref") String transactionRef);

    @Query("SELECT p FROM Payment p JOIN FETCH p.order o WHERE o.user.id = :userId ORDER BY p.createdAt DESC")
    List<Payment> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT p FROM Payment p JOIN FETCH p.order o ORDER BY p.createdAt DESC")
    List<Payment> findAllWithOrder();

    @Query("""
    SELECT p FROM Payment p 
    WHERE p.order.id = :orderId 
    AND p.order.user.id = :userId
""")
    Optional<Payment> findByOrderIdAndUserId(Long orderId, Long userId);

    boolean existsByOrderIdAndStatus(Long orderId, PaymentStatus status);
}
