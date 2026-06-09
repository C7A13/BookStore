package com.project.BookStore.Order.Controller;

import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Order.DTO.Response.OrderResponse;
import com.project.BookStore.Order.DTO.Response.OrderStatisticsResponse;
import com.project.BookStore.Order.Enum.OrderStatus;
import com.project.BookStore.Order.Service.OrderService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminOrderController {

    OrderService orderService;

    @GetMapping
    public ApiResponse<List<OrderResponse>> getAllOrders() {
        return ApiResponse.success(
                orderService.getAllOrders(),
                "Get all orders successfully");
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<OrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        return ApiResponse.success(
                orderService.updateStatus(id, status),
                "Update order status successfully");
    }

    @GetMapping("/statistics")
    public ApiResponse<OrderStatisticsResponse> getStatistics() {
        return ApiResponse.success(
                orderService.getStatistics(),
                "Get order statistics successfully");
    }
}
