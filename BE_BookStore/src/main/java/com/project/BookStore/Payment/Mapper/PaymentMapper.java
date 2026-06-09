package com.project.BookStore.Payment.Mapper;

import com.project.BookStore.Payment.DTO.Response.PaymentResponse;
import com.project.BookStore.Payment.Entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(target = "orderId",   source = "order.id")
    @Mapping(target = "orderCode", source = "order.code")
    PaymentResponse toResponse(Payment payment);

    List<PaymentResponse> toResponseList(List<Payment> payments);
}
