package com.project.BookStore.Payment.Service;

import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.Order.Entity.Order;
import com.project.BookStore.Order.Enum.OrderStatus;
import com.project.BookStore.Order.Repository.OrderRepository;
import com.project.BookStore.Payment.Config.VnpayConfig;
import com.project.BookStore.Order.Service.OrderService;

import com.project.BookStore.Payment.DTO.Request.CreatePaymentRequest;
import com.project.BookStore.Payment.DTO.Request.VnpayCallbackRequest;
import com.project.BookStore.Payment.DTO.Response.PaymentResponse;
import com.project.BookStore.Payment.DTO.Response.VnpayPaymentUrlResponse;
import com.project.BookStore.Payment.Entity.Payment;
import com.project.BookStore.Payment.Enum.PaymentMethod;
import com.project.BookStore.Payment.Enum.PaymentStatus;
import com.project.BookStore.Payment.Mapper.PaymentMapper;
import com.project.BookStore.Payment.Repository.PaymentRepository;
import com.project.BookStore.Payment.Utils.VnpayUtils;
import com.project.BookStore.Auth.Security.UserContextService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentServiceImpl implements PaymentService {

    PaymentRepository paymentRepository;
    OrderRepository   orderRepository;
    UserContextService userContextService;
    PaymentMapper     paymentMapper;
    VnpayConfig       vnpayConfig;
    OrderService      orderService;




    @Override
    @Transactional
    public VnpayPaymentUrlResponse createPayment(CreatePaymentRequest request,
                                                  HttpServletRequest httpRequest) {

        Long userId = userContextService.getRequiredUserId();

        Order order = orderRepository.findByIdWithItems(request.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new AppException(ErrorCode.ORDER_CANNOT_CANCEL);
        }

        if (paymentRepository.existsByOrderIdAndStatus(order.getId(), PaymentStatus.SUCCESS)) {
            throw new AppException(ErrorCode.PAYMENT_ALREADY_SUCCESS);
        }

        // Xóa payment pending/failed cũ nếu có (user thử lại)
        paymentRepository.findByOrderId(order.getId()).ifPresent(existing -> {
            if (existing.getStatus() == PaymentStatus.PENDING || existing.getStatus() == PaymentStatus.FAILED) {
                paymentRepository.delete(existing);
            }
        });

        return switch (order.getPaymentMethod()) {
            case COD          -> handleCod(order, request);
            case VNPAY        -> handleVnpay(order, request, httpRequest);
            default           -> throw new AppException(ErrorCode.INVALID_PAYMENT_METHOD);
        };
    }

    // =========================================================================
    // COD – Thanh toán khi nhận hàng
    // =========================================================================

    private VnpayPaymentUrlResponse handleCod(Order order, CreatePaymentRequest request) {
        Payment payment = Payment.builder()
                .order(order)
                .method(PaymentMethod.COD)
                .status(PaymentStatus.PENDING)
                .amount(order.getTotalAmount())
                .build();

        paymentRepository.save(payment);
        log.info("COD payment created for order {}", order.getCode());

        return VnpayPaymentUrlResponse.builder()
                .paymentUrl(null)
                .txnRef(null)
                .orderId(order.getId())
                .orderCode(order.getCode())
                .build();
    }



    private VnpayPaymentUrlResponse handleVnpay(Order order,
                                                 CreatePaymentRequest request,
                                                 HttpServletRequest httpRequest) {
        String txnRef    = VnpayUtils.generateTxnRef();
        String ipAddr    = VnpayUtils.getIpAddress(httpRequest);
        String createDate = VnpayUtils.getCurrentTimestamp();
        String expireDate = VnpayUtils.getExpireTimestamp(2);
        String orderInfo  = "Thanh toan don hang " + order.getCode();

        // VNPay yêu cầu amount * 100
        long amount = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();

        // Lưu payment PENDING với transaction_ref = txnRef
        Payment payment = Payment.builder()
                .order(order)
                .method(PaymentMethod.VNPAY)
                .status(PaymentStatus.PENDING)
                .amount(order.getTotalAmount())
                .transactionRef(txnRef)
                .build();
        paymentRepository.save(payment);

        // Build params gửi VNPay
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version",    vnpayConfig.getVersion());
        params.put("vnp_Command",    vnpayConfig.getCommand());
        params.put("vnp_TmnCode",    vnpayConfig.getTmnCode());
        params.put("vnp_Amount",     String.valueOf(amount));
        params.put("vnp_CurrCode",   vnpayConfig.getCurrencyCode());
        params.put("vnp_TxnRef",     txnRef);
        params.put("vnp_OrderInfo",  orderInfo);
        params.put("vnp_OrderType",  "other");
        params.put("vnp_Locale",     vnpayConfig.getLocale());
        params.put("vnp_ReturnUrl",  vnpayConfig.getReturnUrl());
        params.put("vnp_IpAddr",     ipAddr);
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        String hashData    = VnpayUtils.buildHashData(params);
        String secureHash  = VnpayUtils.hmacSHA512(vnpayConfig.getHashSecret(), hashData);
        String queryString = VnpayUtils.buildQueryString(params) + "&vnp_SecureHash=" + secureHash;
        String paymentUrl  = vnpayConfig.getPaymentUrl() + "?" + queryString;

        log.info("VNPay URL created for order {} | txnRef={}", order.getCode(), txnRef);

        return VnpayPaymentUrlResponse.builder()
                .paymentUrl(paymentUrl)
                .txnRef(txnRef)
                .orderId(order.getId())
                .orderCode(order.getCode())
                .build();
    }
    


    @Override
    @Transactional
    public String handleVnpayIpn(VnpayCallbackRequest callback) {
        try {
            log.info("VNPay IPN: txnRef={}, responseCode={}", callback.getVnp_TxnRef(), callback.getVnp_ResponseCode());

            if (!verifySignature(callback)) {
                return "97|Invalid Signature";
            }

            Payment payment = paymentRepository.findByTransactionRef(callback.getVnp_TxnRef())
                    .orElse(null);
            if (payment == null) return "01|Order not Found";

            if (payment.getStatus() != PaymentStatus.PENDING) {
                return "02|Order already confirmed";
            }

            // Kiểm tra số tiền
            long received = Long.parseLong(callback.getVnp_Amount());
            long expected = payment.getAmount().multiply(BigDecimal.valueOf(100)).longValue();
            if (received != expected) return "04|Invalid Amount";

            updatePayment(payment, callback);
            paymentRepository.save(payment);

            if ("00".equals(callback.getVnp_ResponseCode())) {
                Order order = payment.getOrder();
                orderService.updateStatus(order.getId(), OrderStatus.CONFIRMED);
                log.info("Order {} confirmed via VNPay IPN", order.getCode());
            }


            return "00|Confirm Success";
        } catch (Exception e) {
            log.error("VNPay IPN error", e);
            return "99|Unknown error";
        }
    }

    // =========================================================================
    // VNPay Return URL – Trình duyệt redirect về sau thanh toán
    // =========================================================================

    @Override
    @Transactional
    public PaymentResponse handleVnpayReturn(VnpayCallbackRequest callback) {
        log.info("VNPay Return: txnRef={}, responseCode={}", callback.getVnp_TxnRef(), callback.getVnp_ResponseCode());

        if (!verifySignature(callback)) {
            throw new AppException(ErrorCode.VNPAY_INVALID_SIGNATURE);
        }

        Payment payment = paymentRepository.findByTransactionRef(callback.getVnp_TxnRef())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        // Chỉ cập nhật nếu IPN chưa xử lý trước
        if (payment.getStatus() == PaymentStatus.PENDING) {
            updatePayment(payment, callback);
            paymentRepository.save(payment);

            if ("00".equals(callback.getVnp_ResponseCode())) {
                Order order = payment.getOrder();
                orderService.updateStatus(order.getId(), OrderStatus.CONFIRMED);
            }

        }

        return paymentMapper.toResponse(payment);
    }

    // =========================================================================
    // Query
    // =========================================================================

    @Override
    public PaymentResponse getByOrderId(Long orderId) {

        Payment  payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        Long currentUserId = userContextService.getRequiredUserId();

        if (!payment.getOrder().getUser().getId().equals(currentUserId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return paymentMapper.toResponse(payment);
    }

    @Override
    public List<PaymentResponse> getMyPayments() {
        Long userId = userContextService.getRequiredUserId();
        return paymentMapper.toResponseList(paymentRepository.findAllByUserId(userId));
    }

    // =========================================================================
    // Admin
    // =========================================================================

    @Override
    public List<PaymentResponse> getAllPayments() {
        return paymentMapper.toResponseList(paymentRepository.findAllWithOrder());
    }

    @Override
    @Transactional
    public PaymentResponse refundPayment(Long paymentId, String note) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new AppException(ErrorCode.PAYMENT_CANNOT_REFUND);
        }

        payment.setStatus(PaymentStatus.PENDING); // đặt lại pending chờ hoàn
        log.info("Payment {} marked for refund. Note: {}", paymentId, note);

        Order order = payment.getOrder();
        order.setStatus(OrderStatus.REFUNDED);
        orderRepository.save(order);

        return paymentMapper.toResponse(paymentRepository.save(payment));
    }

    // =========================================================================
    // Private helpers
    // =========================================================================

    private boolean verifySignature(VnpayCallbackRequest callback) {
        String receivedHash = callback.getVnp_SecureHash();
        if (receivedHash == null || receivedHash.isBlank()) return false;

        Map<String, String> params = new HashMap<>();
        params.put("vnp_TmnCode",           callback.getVnp_TmnCode());
        params.put("vnp_Amount",            callback.getVnp_Amount());
        params.put("vnp_BankCode",          callback.getVnp_BankCode());
        params.put("vnp_BankTranNo",        callback.getVnp_BankTranNo());
        params.put("vnp_CardType",          callback.getVnp_CardType());
        params.put("vnp_PayDate",           callback.getVnp_PayDate());
        params.put("vnp_OrderInfo",         callback.getVnp_OrderInfo());
        params.put("vnp_TransactionNo",     callback.getVnp_TransactionNo());
        params.put("vnp_ResponseCode",      callback.getVnp_ResponseCode());
        params.put("vnp_TransactionStatus", callback.getVnp_TransactionStatus());
        params.put("vnp_TxnRef",            callback.getVnp_TxnRef());
        params.values().removeIf(v -> v == null || v.isBlank());

        String computed = VnpayUtils.hmacSHA512(
                vnpayConfig.getHashSecret(),
                VnpayUtils.buildHashData(params));

        return computed.equalsIgnoreCase(receivedHash);
    }

    private void updatePayment(Payment payment, VnpayCallbackRequest callback) {
        boolean success = "00".equals(callback.getVnp_ResponseCode());
        payment.setStatus(success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);
        // Lưu transaction number VNPay trả về vào transaction_ref (ghi đè txnRef ban đầu)
        if (callback.getVnp_TransactionNo() != null) {
            payment.setTransactionRef(callback.getVnp_TxnRef());
        }
        if (success) {
            payment.setPaidAt(LocalDateTime.now());
        }
    }
}
