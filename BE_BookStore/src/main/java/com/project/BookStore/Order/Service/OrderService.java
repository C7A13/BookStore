package com.project.BookStore.Order.Service;

import com.project.BookStore.Order.DTO.Response.OrderResponse;
import com.project.BookStore.Order.DTO.Response.OrderStatisticsResponse;
import com.project.BookStore.Order.Enum.OrderStatus;

import java.util.List;

public interface OrderService {
    List<OrderResponse> getMyOrders();
    OrderResponse getOrderDetail(Long id);
    OrderResponse getOrderByCode(String code);
    void cancelOrder(Long id);

    // Admin
    OrderResponse updateStatus(Long id, OrderStatus status);
    List<OrderResponse> getAllOrders();
    OrderStatisticsResponse getStatistics();
}
