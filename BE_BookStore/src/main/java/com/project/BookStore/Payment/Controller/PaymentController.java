package com.project.BookStore.Payment.Controller;

import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Payment.DTO.Request.CreatePaymentRequest;
import com.project.BookStore.Payment.DTO.Request.VnpayCallbackRequest;
import com.project.BookStore.Payment.DTO.Response.PaymentResponse;
import com.project.BookStore.Payment.DTO.Response.VnpayPaymentUrlResponse;
import com.project.BookStore.Payment.Service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Payment Controller – User endpoints
 *
 * POST  /payments                  → Tạo payment (COD hoặc VNPAY)
 * GET   /payments                  → Lịch sử payment của user hiện tại
 * GET   /payments/order/{orderId}  → Lấy payment theo orderId
 * GET   /payments/vnpay/return     → VNPay redirect trình duyệt về sau thanh toán
 * POST  /payments/vnpay/ipn        → VNPay IPN – server-to-server callback
 */
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {

    PaymentService paymentService;

    // =========================================================================
    // POST /payments – Tạo payment mới
    // =========================================================================


    @PostMapping
    public ApiResponse<VnpayPaymentUrlResponse> createPayment(
            @Valid @RequestBody CreatePaymentRequest request,
            HttpServletRequest httpRequest) {
        return ApiResponse.success(
                paymentService.createPayment(request, httpRequest),
                "Payment created successfully");
    }

    // =========================================================================
    // GET /payments – Lịch sử payment của user hiện tại
    // =========================================================================

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ApiResponse<List<PaymentResponse>> getMyPayments() {
        return ApiResponse.success(
                paymentService.getMyPayments(),
                "Get payment history successfully");
    }

    // =========================================================================
    // GET /payments/order/{orderId} – Lấy payment theo orderId
    // =========================================================================

    @GetMapping("/order/{orderId}")
    public ApiResponse<PaymentResponse> getPaymentByOrder(@PathVariable Long orderId) {
        return ApiResponse.success(
                paymentService.getByOrderId(orderId),
                "Get payment successfully");
    }

    // =========================================================================
    // GET /payments/vnpay/return – VNPay redirect browser về sau thanh toán
    // =========================================================================

    /**
     * VNPay redirect trình duyệt user về URL này sau khi thanh toán.
     * Tất cả params VNPay được map vào VnpayCallbackRequest qua @ModelAttribute.
     *
     * Frontend nên gọi endpoint này sau khi nhận redirect, hoặc có thể là
     * backend trực tiếp xử lý rồi redirect sang trang kết quả.
     */
    @GetMapping("/vnpay/return")
    public void vnpayReturn(
            @ModelAttribute VnpayCallbackRequest callback,
            jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        PaymentResponse payment = paymentService.handleVnpayReturn(callback);
        boolean success = "SUCCESS".equals(payment.getStatus().name());
        String frontendUrl = "http://localhost:5173/my-orders?paymentStatus=" + (success ? "success" : "failed");
        response.sendRedirect(frontendUrl);
    }

    // =========================================================================
    // POST /payments/vnpay/ipn – VNPay server-to-server IPN
    // =========================================================================

    /**
     * VNPay server gọi về endpoint này để xác nhận giao dịch (Instant Payment Notification).
     * Phải trả về chuỗi text "RspCode|Message" theo đúng chuẩn VNPay.
     * VNPay gửi callback qua HTTP GET.
     * Endpoint này PHẢI public (không cần JWT).
     */
    @GetMapping("/vnpay/ipn")
    public ResponseEntity<String> vnpayIpn(
            @ModelAttribute VnpayCallbackRequest callback) {
        String result = paymentService.handleVnpayIpn(callback);
        return ResponseEntity.ok(result);
    }
}
