package com.project.BookStore.Payment.DTO.Request;

import lombok.*;

import java.util.Map;

/**
 * Đóng gói toàn bộ params VNPay gửi về qua IPN / Return URL
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VnpayCallbackRequest {
    private String vnp_TmnCode;
    private String vnp_Amount;
    private String vnp_BankCode;
    private String vnp_BankTranNo;
    private String vnp_CardType;
    private String vnp_PayDate;
    private String vnp_OrderInfo;
    private String vnp_TransactionNo;
    private String vnp_ResponseCode;
    private String vnp_TransactionStatus;
    private String vnp_TxnRef;
    private String vnp_SecureHash;
}
