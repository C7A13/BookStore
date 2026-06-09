package com.project.BookStore.Checkout.DTO.Request;

import com.project.BookStore.Payment.Enum.PaymentMethod;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {

    private List<Long> cartItemIds;

    @NotNull(message = "Address ID is required")
    private Long addressId;

    private List<String> promotionCodes;

    private String note;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private BuyNowItem buyNowItem;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BuyNowItem {
        @NotNull(message = "Book ID is required")
        private Long bookId;

        @Min(value = 1, message = "Quantity must be at least 1")
        private int quantity;
    }
}
