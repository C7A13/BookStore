package com.project.BookStore.Payment.Service;

import com.project.BookStore.Payment.DTO.Request.CreatePaymentRequest;
import com.project.BookStore.Payment.DTO.Request.VnpayCallbackRequest;
import com.project.BookStore.Payment.DTO.Response.PaymentResponse;
import com.project.BookStore.Payment.DTO.Response.VnpayPaymentUrlResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface PaymentService {

    /**
     * Tạo bản ghi Payment cho đơn hàng (COD hoặc VNPAY).
     * Nếu là VNPAY, trả về URL thanh toán.
     */
    VnpayPaymentUrlResponse createPayment(CreatePaymentRequest request, HttpServletRequest httpRequest);

    /**
     * Xử lý IPN (Instant Payment Notification) từ VNPay server gọi về.
     * Trả về chuỗi "RspCode|Message" theo chuẩn VNPay.
     */
    String handleVnpayIpn(VnpayCallbackRequest callback);

    /**
     * Xử lý Return URL – VNPay redirect trình duyệt về sau khi thanh toán.
     * Kiểm tra chữ ký và trả về kết quả cho client.
     */
    PaymentResponse handleVnpayReturn(VnpayCallbackRequest callback);

    /**
     * Lấy thông tin payment theo orderId.
     */
    PaymentResponse getByOrderId(Long orderId);

    /**
     * Lấy danh sách payment của user hiện tại.
     */
    List<PaymentResponse> getMyPayments();

    // ===== Admin =====

    /**
     * Lấy toàn bộ danh sách payment (Admin).
     */
    List<PaymentResponse> getAllPayments();

    /**
     * Hoàn tiền một giao dịch (Admin).
     */
    PaymentResponse refundPayment(Long paymentId, String note);
}
