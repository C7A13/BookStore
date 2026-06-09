package com.project.BookStore.Payment.DTO.Response;

import com.project.BookStore.Payment.Enum.PaymentMethod;
import com.project.BookStore.Payment.Enum.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long orderId;
    private String orderCode;
    private PaymentMethod method;
    private BigDecimal amount;
    private PaymentStatus status;
    private String transactionRef;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}
