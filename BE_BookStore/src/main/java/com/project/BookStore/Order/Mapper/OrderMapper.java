package com.project.BookStore.Order.Mapper;

import com.project.BookStore.Order.DTO.Response.OrderItemResponse;
import com.project.BookStore.Order.DTO.Response.OrderResponse;
import com.project.BookStore.Order.Entity.Order;
import com.project.BookStore.Order.Entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "addressId", source = "address.id")
    @Mapping(target = "items", source = "orderItems")
    @Mapping(target = "orderedAt", source = "createdAt")
    @Mapping(target = "customerName", source = "user.fullName")
    @Mapping(target = "customerEmail", source = "user.email")
    @Mapping(target = "address", expression = "java(formatAddress(order.getAddress()))")
    @Mapping(target = "paymentMethod", source = "paymentMethod")
    OrderResponse toResponse(Order order);

    default String formatAddress(com.project.BookStore.Address.Entity.Address address) {
        if (address == null) return "";
        StringBuilder sb = new StringBuilder();
        if (address.getDetailAddress() != null) sb.append(address.getDetailAddress());
        if (address.getWard() != null) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(address.getWard());
        }
        if (address.getProvince() != null) {
            if (sb.length() > 0) sb.append(", ");
            sb.append(address.getProvince());
        }
        return sb.toString();
    }

    @Mapping(target = "bookId", source = "book.id")
    @Mapping(target = "bookTitle", source = "book.title")
    @Mapping(target = "bookImage", source = "book.coverImage")
    OrderItemResponse toItemResponse(OrderItem orderItem);

    List<OrderResponse> toResponseList(List<Order> orders);
}
