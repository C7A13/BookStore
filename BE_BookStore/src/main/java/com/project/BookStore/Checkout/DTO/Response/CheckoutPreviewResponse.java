package com.project.BookStore.Checkout.DTO.Response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CheckoutPreviewResponse {
    List<AddressResponse> addresses;
    List<CartItemResponse> cartItems;
    List<PromotionUsageResponse> availablePromotions;
    CalculationResponse calculation;

    // 2. Thông tin địa chỉ giao hàng
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class AddressResponse {
        Long id;
        String recipientName;
        String recipientPhone;
        String province;
        String ward;
        String detailAddress;
        boolean isDefault;
    }

    // 3. Thông tin sản phẩm tóm tắt
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class CartItemResponse {
        Long cartItemId;
        Long bookId;
        String title;
        BigDecimal price;
        int quantity;
        String img;
        BigDecimal lineTotal;
    }


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class PromotionUsageResponse {
        Long id;
        String code;
        String description;
        String type;
        @JsonProperty("isEligible")
        boolean isEligible;
        String reason;
    }


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class CalculationResponse {
        int totalQuantity;
        BigDecimal subtotal;
        BigDecimal shippingFee;
        BigDecimal shippingDiscount;
        BigDecimal orderDiscount;
        BigDecimal totalAmount;
        String appliedDiscountCode;
        String appliedShippingCode;
    }
}