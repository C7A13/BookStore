package com.project.BookStore.Order.DTO.Response;

import com.project.BookStore.Order.Enum.OrderStatus;
import com.project.BookStore.Payment.Enum.PaymentMethod;
import com.project.BookStore.Payment.Enum.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String code;
    private Long userId;
    private Long addressId;
    private BigDecimal subtotal;
    private BigDecimal shippingFee;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private Integer pointsEarned;
    private String promotionCode;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String source;
    private String note;
    private LocalDateTime orderedAt;
    private LocalDateTime deliveredAt;
    private String customerName;
    private String customerEmail;
    private String address;
    private List<OrderItemResponse> items;
}
