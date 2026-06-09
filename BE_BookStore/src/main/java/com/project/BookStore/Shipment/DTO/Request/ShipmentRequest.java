package com.project.BookStore.Shipment.DTO.Request;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShipmentRequest {

    @NotNull(message = "Order ID is required")
    Long orderId;

    String carrierName;
    String trackingCode;

    @NotNull(message = "Shipping fee is required")
    BigDecimal shippingFee;

}
