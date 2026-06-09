package com.project.BookStore.Payment.Entity;

import com.project.BookStore.Order.Entity.Order;
import com.project.BookStore.Payment.Enum.PaymentMethod;
import com.project.BookStore.Payment.Enum.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Maps to the existing `payments` table in DB_BookStoreFN.sql
 *
 * CREATE TABLE payments (
 * id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 * order_id INT UNSIGNED NOT NULL,
 * method VARCHAR(30) NOT NULL,
 * amount DECIMAL(15,0) NOT NULL,
 * status VARCHAR(20) NOT NULL DEFAULT 'pending',
 * transaction_ref VARCHAR(150) DEFAULT NULL,
 * paid_at DATETIME DEFAULT NULL,
 * created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
 * );
 *
 * Bảng này immutable – không có updated_at, deleted_at → KHÔNG extends
 * BaseEntity
 */
@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    Order order;


    @Enumerated(EnumType.STRING)
    @Column(name = "method", nullable = false, length = 30)
    PaymentMethod method;

    @Column(nullable = false, precision = 15, scale = 0)
    BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    PaymentStatus status = PaymentStatus.PENDING;


    @Column(name = "transaction_ref", length = 150)
    String transactionRef;

    @Column(name = "paid_at")
    LocalDateTime paidAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
