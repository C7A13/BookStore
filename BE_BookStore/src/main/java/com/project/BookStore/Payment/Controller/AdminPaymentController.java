package com.project.BookStore.Payment.Controller;

import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Payment.DTO.Response.PaymentResponse;
import com.project.BookStore.Payment.Service.PaymentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin Payment Controller
 *
 * GET   /admin/payments             → Lấy toàn bộ danh sách payment
 * GET   /admin/payments/{id}        → Lấy chi tiết một payment
 * PATCH /admin/payments/{id}/refund → Hoàn tiền một payment
 */
@RestController
@RequestMapping("/admin/payments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminPaymentController {

    PaymentService paymentService;

    // =========================================================================
    // GET /admin/payments – Toàn bộ danh sách payment
    // =========================================================================

    @GetMapping
    public ApiResponse<List<PaymentResponse>> getAllPayments() {
        return ApiResponse.success(
                paymentService.getAllPayments(),
                "Get all payments successfully");
    }

    // =========================================================================
    // GET /admin/payments/order/{orderId} – Payment theo orderId
    // =========================================================================

    @GetMapping("/order/{orderId}")
    public ApiResponse<PaymentResponse> getPaymentByOrder(@PathVariable Long orderId) {
        return ApiResponse.success(
                paymentService.getByOrderId(orderId),
                "Get payment successfully");
    }

    // =========================================================================
    // PATCH /admin/payments/{id}/refund – Hoàn tiền
    // =========================================================================

    /**
     * Admin đánh dấu giao dịch là REFUNDED.
     * Đồng thời cập nhật trạng thái đơn hàng liên kết thành REFUNDED.
     *
     * @param id   Payment ID
     * @param note Ghi chú lý do hoàn tiền (optional)
     */
    @PatchMapping("/{id}/refund")
    public ApiResponse<PaymentResponse> refundPayment(
            @PathVariable Long id,
            @RequestParam(required = false) String note) {
        return ApiResponse.success(
                paymentService.refundPayment(id, note),
                "Payment refunded successfully");
    }
}
