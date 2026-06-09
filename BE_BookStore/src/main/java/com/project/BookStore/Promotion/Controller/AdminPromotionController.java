package com.project.BookStore.Promotion.Controller;

import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.Promotion.DTO.Request.PromotionRequest;
import com.project.BookStore.Promotion.DTO.Response.PromotionResponse;
import com.project.BookStore.Promotion.Service.PromotionService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/promotions")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminPromotionController {

    PromotionService promotionService;

    @PostMapping
    public ApiResponse<PromotionResponse> createPromotion(@RequestBody @Valid PromotionRequest request) {
        return ApiResponse.success(promotionService.createPromotion(request), "Promotion created successfully");
    }

    @PutMapping("/{id}")
    public ApiResponse<PromotionResponse> updatePromotion(@PathVariable Long id, @RequestBody @Valid PromotionRequest request) {
        return ApiResponse.success(promotionService.updatePromotion(id, request), "Promotion updated successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePromotion(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return ApiResponse.success(null, "Promotion deleted successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<PromotionResponse> getPromotion(@PathVariable Long id) {
        return ApiResponse.success(promotionService.getPromotionById(id), "Promotion retrieved successfully");
    }

    @GetMapping
    public ApiResponse<PageResponse<PromotionResponse>> getAllPromotions(Pageable pageable) {
        return ApiResponse.success(promotionService.getAllPromotions(pageable), "Promotions retrieved successfully");
    }

    @PatchMapping("/{id}/toggle-status")
    public ApiResponse<Void> toggleStatus(@PathVariable Long id) {
        promotionService.toggleStatus(id);
        return ApiResponse.success(null, "Promotion status toggled successfully");
    }
}
