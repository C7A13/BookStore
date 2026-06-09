package com.project.BookStore.Payment.DTO.Request;

import com.project.BookStore.Payment.Enum.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentRequest {

    @NotNull(message = "Order ID is required")
    private Long orderId;


    private String note;
}
