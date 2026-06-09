package com.project.BookStore.Shipment.DTO.Response;

import lombok.*;
import lombok.experimental.FieldDefaults;
import com.project.BookStore.Shipment.Enum.ShipmentStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShipmentResponse {
    Long id;
    Long orderId;
    String orderCode;
    String carrierName;
    String trackingCode;
    ShipmentStatus status;
    BigDecimal shippingFee;
    BigDecimal codAmount;
    LocalDateTime shippedAt;
    LocalDateTime deliveredAt;
    LocalDateTime createdAt;
}