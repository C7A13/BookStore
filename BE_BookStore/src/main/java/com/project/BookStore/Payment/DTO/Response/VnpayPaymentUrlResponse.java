package com.project.BookStore.Payment.DTO.Response;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VnpayPaymentUrlResponse {
    private String paymentUrl;
    private String txnRef;
    private Long orderId;
    private String orderCode;
}
