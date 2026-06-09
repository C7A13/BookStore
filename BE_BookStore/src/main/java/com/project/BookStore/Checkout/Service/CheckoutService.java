package com.project.BookStore.Checkout.Service;

import com.project.BookStore.Checkout.DTO.Request.CheckoutRequest;
import com.project.BookStore.Checkout.DTO.Response.CheckoutPreviewResponse;
import com.project.BookStore.Order.DTO.Response.OrderResponse;

public interface CheckoutService {
    OrderResponse checkout(CheckoutRequest request);

    CheckoutPreviewResponse preview(CheckoutRequest request);
}
