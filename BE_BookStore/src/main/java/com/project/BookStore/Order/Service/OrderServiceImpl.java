package com.project.BookStore.Order.Service;

import com.project.BookStore.Book.Repository.BookRepository;
import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.Inventory.Service.InventoryService;
import com.project.BookStore.Order.DTO.Response.OrderResponse;
import com.project.BookStore.Order.DTO.Response.OrderStatisticsResponse;
import com.project.BookStore.Order.Entity.Order;
import com.project.BookStore.Order.Entity.OrderItem;
import com.project.BookStore.Order.Enum.OrderStatus;
import com.project.BookStore.Order.Mapper.OrderMapper;
import com.project.BookStore.Order.Repository.OrderRepository;
import com.project.BookStore.Auth.Security.UserContextService;
import com.project.BookStore.Promotion.Entity.PromotionUsage;
import com.project.BookStore.Promotion.Repository.PromotionRepository;
import com.project.BookStore.Promotion.Repository.PromotionUsageRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.project.BookStore.Shipment.Repository.ShipmentRepository;
import com.project.BookStore.Shipment.Entity.Shipment;
import com.project.BookStore.Shipment.Enum.ShipmentStatus;
import com.project.BookStore.Payment.Enum.PaymentMethod;
import com.project.BookStore.Payment.Enum.PaymentStatus;
import com.project.BookStore.Payment.Repository.PaymentRepository;
import com.project.BookStore.Payment.Entity.Payment;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderServiceImpl implements OrderService {

    OrderRepository orderRepository;
    BookRepository bookRepository;
    UserContextService userContextService;
    OrderMapper orderMapper;
    PromotionRepository promotionRepository;
    PromotionUsageRepository promotionUsageRepository;
    InventoryService inventoryService;
    ShipmentRepository shipmentRepository;
    PaymentRepository paymentRepository;


    @Override
    public List<OrderResponse> getMyOrders() {
        Long userId = userContextService.getRequiredUserId();
        List<Order> orders = orderRepository.findAllByUserIdWithItems(userId);
        return orders.stream().map(order -> {
            OrderResponse response = orderMapper.toResponse(order);
            paymentRepository.findByOrderId(order.getId())
                    .ifPresent(payment -> response.setPaymentStatus(payment.getStatus()));
            return response;
        }).collect(Collectors.toList());
    }

    @Override
    public OrderResponse getOrderDetail(Long id) {
        Order order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        OrderResponse response = orderMapper.toResponse(order);
        paymentRepository.findByOrderId(order.getId())
                .ifPresent(payment -> response.setPaymentStatus(payment.getStatus()));
        return response;
    }

    @Override
    @PostAuthorize("returnObject.user.id == authentication.principal.claims['id']")
    public OrderResponse getOrderByCode(String code) {
        Order order = orderRepository.findByCodeWithItems(code)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        OrderResponse response = orderMapper.toResponse(order);
        paymentRepository.findByOrderId(order.getId())
                .ifPresent(payment -> response.setPaymentStatus(payment.getStatus()));
        return response;
    }

    private void restoreStockAndVouchers(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            bookRepository.increaseStock(item.getBook().getId(), item.getQuantity());
        }
        inventoryService.recordReturn(order);

        List<PromotionUsage> usages = promotionUsageRepository.findByOrderId(order.getId());
        for (PromotionUsage usage : usages) {
            if (!usage.getIsCancelled()) {
                promotionRepository.decrementUsedCount(usage.getPromotion().getId());
                usage.setIsCancelled(true);
                promotionUsageRepository.save(usage);
            }
        }
    }

    @Override
    @Transactional
    public void cancelOrder(Long id) {
        Order order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (!order.getStatus().equals(OrderStatus.PENDING)) {
            throw new AppException(ErrorCode.ORDER_CANNOT_CANCEL);
        }

        order.setStatus(OrderStatus.CANCELLED);
        restoreStockAndVouchers(order);
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus status) {
        Order order = orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // Logic đặc biệt khi chuyển trạng thái
        if (status.equals(OrderStatus.CANCELLED) && !order.getStatus().equals(OrderStatus.CANCELLED)) {
            restoreStockAndVouchers(order);
        }

        // Tự động tạo Shipment khi đơn chuyển sang CONFIRMED và chưa có Shipment nào
        if (status.equals(OrderStatus.CONFIRMED) && !order.getStatus().equals(OrderStatus.CONFIRMED)) {
            if (shipmentRepository.findByOrderId(order.getId()).isEmpty()) {
                Shipment shipment = Shipment.builder()
                        .order(order)
                        .carrierName("Giao hàng tiêu chuẩn")
                        .trackingCode("TRK" + order.getCode())
                        .status(ShipmentStatus.READY_TO_PICK)
                        .shippingFee(order.getShippingFee())
                        .codAmount(order.getPaymentMethod() == PaymentMethod.COD ? order.getTotalAmount() : java.math.BigDecimal.ZERO)
                        .build();
                shipmentRepository.save(shipment);
            }
        }

        order.setStatus(status);
        if (status.equals(OrderStatus.DELIVERED)) {
            order.setDeliveredAt(LocalDateTime.now());
        }

        Order savedOrder = orderRepository.save(order);
        OrderResponse response = orderMapper.toResponse(savedOrder);
        paymentRepository.findByOrderId(savedOrder.getId())
                .ifPresent(payment -> response.setPaymentStatus(payment.getStatus()));
        return response;
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAllWithItems();
        return orders.stream().map(order -> {
            OrderResponse response = orderMapper.toResponse(order);
            paymentRepository.findByOrderId(order.getId())
                    .ifPresent(payment -> response.setPaymentStatus(payment.getStatus()));
            return response;
        }).collect(Collectors.toList());
    }

    @org.springframework.scheduling.annotation.Scheduled(fixedRate = 60000)
    @Transactional
    public void cancelExpiredVnpayOrders() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(2);
        List<Order> expiredOrders = orderRepository.findExpiredVnpayOrders(threshold);
        for (Order order : expiredOrders) {
            order.setStatus(OrderStatus.CANCELLED);
            restoreStockAndVouchers(order);
            orderRepository.save(order);

            log.info("Checking payment for expired order ID: {}, code: {}", order.getId(), order.getCode());
            paymentRepository.findByOrderId(order.getId()).ifPresentOrElse(payment -> {
                log.info("Found payment ID: {}, status: {}", payment.getId(), payment.getStatus());
                if (payment.getStatus() == PaymentStatus.PENDING) {
                    payment.setStatus(PaymentStatus.EXPIRED);
                    paymentRepository.save(payment);
                    log.info("Successfully updated payment ID: {} to EXPIRED", payment.getId());
                } else {
                    log.info("Payment ID: {} is not PENDING, skipped update. Current status: {}", payment.getId(), payment.getStatus());
                }
            }, () -> {
                log.warn("No payment record found for order ID: {}", order.getId());
            });

            log.info("Auto-cancelled expired VNPay order: {}", order.getCode());
        }
    }

    @Override
    public OrderStatisticsResponse getStatistics() {
        Long totalOrders = orderRepository.countTotalOrders();
        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        Long totalCustomers = orderRepository.countTotalCustomers();

        List<Object[]> statusCounts = orderRepository.countOrdersByStatus();
        Map<String, Long> ordersByStatus = statusCounts.stream()
                .collect(Collectors.toMap(
                        row -> row[0].toString(),
                        row -> (Long) row[1]
                ));

        return OrderStatisticsResponse.builder()
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .ordersByStatus(ordersByStatus)
                .totalCustomers(totalCustomers)
                .build();
    }
}
