package com.project.BookStore.Shipment.Entity;


import com.project.BookStore.Common.Entity.BaseEntity;
import com.project.BookStore.Order.Entity.Order;
import com.project.BookStore.Shipment.Enum.ShipmentStatus;
import jakarta.persistence.*;
import org.hibernate.annotations.SQLRestriction;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@SQLRestriction("deleted_at IS NULL")
public class Shipment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    Order order;

    @Column(name = "carrier_name", length = 80)
    String carrierName;

    @Column(name = "tracking_code", length = 100)
    String trackingCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    ShipmentStatus status = ShipmentStatus.READY_TO_PICK;

    @Column(name = "shipping_fee", nullable = false, precision = 12, scale = 0)
    @Builder.Default
    BigDecimal shippingFee = BigDecimal.ZERO;

    @Column(name = "cod_amount", nullable = false, precision = 12, scale = 0)
    @Builder.Default
    BigDecimal codAmount = BigDecimal.ZERO;

    @Column(name = "shipped_at")
    LocalDateTime shippedAt;

    @Column(name = "delivered_at")
    LocalDateTime deliveredAt;

}
