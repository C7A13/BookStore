package com.project.BookStore.Order.Controller;

import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Order.DTO.Response.OrderResponse;
import com.project.BookStore.Order.Service.OrderService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {

    OrderService orderService;

    @GetMapping
    public ApiResponse<List<OrderResponse>> getMyOrders() {
        return ApiResponse.success(
                orderService.getMyOrders(),
                "Get order history successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<OrderResponse> getOrderDetail(@PathVariable Long id) {
        return ApiResponse.success(
                orderService.getOrderDetail(id),
                "Get order detail successfully");
    }

    @GetMapping("/code/{code}")
    public ApiResponse<OrderResponse> getOrderByCode(@PathVariable String code) {
        return ApiResponse.success(
                orderService.getOrderByCode(code),
                "Get order by code successfully");
    }

    @PostMapping("/{id}/cancel")
    public ApiResponse<Void> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ApiResponse.success("Cancel order successfully");
    }
}
