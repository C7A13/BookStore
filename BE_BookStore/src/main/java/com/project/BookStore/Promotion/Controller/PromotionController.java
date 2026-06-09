package com.project.BookStore.Promotion.Controller;

import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Promotion.DTO.Response.PromotionResponse;
import com.project.BookStore.Promotion.Service.PromotionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/promotions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PromotionController {

    PromotionService promotionService;

    @GetMapping("/active")
    public ApiResponse<List<PromotionResponse>> getActivePromotions() {
        return ApiResponse.success(promotionService.getActivePromotions(), "Active promotions retrieved successfully");
    }
}
