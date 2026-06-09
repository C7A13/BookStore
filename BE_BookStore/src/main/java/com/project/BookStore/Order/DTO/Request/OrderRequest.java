package com.project.BookStore.Order.DTO.Request;

import com.project.BookStore.Payment.Enum.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {

    @NotNull(message = "Address ID is required")
    private Long addressId;

    private String promotionCode;

    private String note;

    private List<Long> CartItemIds;

    private PaymentMethod paymentMethod;
}
