package com.project.BookStore.Checkout.Controller;

import com.project.BookStore.Checkout.DTO.Request.CheckoutRequest;
import com.project.BookStore.Checkout.DTO.Response.CheckoutPreviewResponse;
import com.project.BookStore.Checkout.Service.CheckoutService;
import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Order.DTO.Response.OrderResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/checkout")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CheckoutController {

    CheckoutService checkoutService;

    @PostMapping("/preview")
    public ApiResponse<CheckoutPreviewResponse> preview(@Valid @RequestBody CheckoutRequest request) {
        return ApiResponse.success(
                checkoutService.preview(request),
                "Preview checkout successfully");
    }

    @PostMapping
    public ApiResponse<OrderResponse> checkout(@Valid @RequestBody CheckoutRequest request) {
        return ApiResponse.success(
                checkoutService.checkout(request),
                "Checkout successfully");
    }
}
