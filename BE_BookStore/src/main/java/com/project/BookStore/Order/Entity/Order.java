package com.project.BookStore.Order.Entity;

import com.project.BookStore.Address.Entity.Address;
import com.project.BookStore.Common.Entity.BaseEntity;
import com.project.BookStore.Order.Enum.OrderStatus;
import com.project.BookStore.Payment.Enum.PaymentMethod;
import com.project.BookStore.User.Entity.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@AttributeOverride(name = "createdAt", column = @Column(name = "ordered_at"))
public class Order extends BaseEntity {

    @Column(nullable = false, unique = true, length = 30)
    String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    Address address;

    @Column(nullable = false, precision = 15, scale = 0)
    BigDecimal subtotal;

    @Column(name = "shipping_fee", nullable = false, precision = 12, scale = 0)
    BigDecimal shippingFee;

    @Column(name = "discount_amount", nullable = false, precision = 12, scale = 0)
    BigDecimal discountAmount;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 0)
    BigDecimal totalAmount;

    @Column(name = "points_earned", nullable = false)
    @Builder.Default
    Integer pointsEarned = 0;

    @Column(name = "promotion_code", length = 50)
    String promotionCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    OrderStatus status = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 30)
    private PaymentMethod paymentMethod;

    @Column(nullable = false, length = 20)
    @Builder.Default
    String source = "web";

    @Column(columnDefinition = "TEXT")
    String note;

    @Column(name = "delivered_at")
    LocalDateTime deliveredAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<OrderItem> orderItems = new ArrayList<>();
}
