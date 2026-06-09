package com.project.BookStore.Promotion.Service;

import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.Promotion.DTO.Request.PromotionRequest;
import com.project.BookStore.Promotion.DTO.Response.PromotionCalculationResult;
import com.project.BookStore.Promotion.DTO.Response.PromotionResponse;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface PromotionService {
    PromotionResponse createPromotion(PromotionRequest request);
    PromotionResponse updatePromotion(Long id, PromotionRequest request);
    void deletePromotion(Long id);
    PromotionResponse getPromotionById(Long id);
    PageResponse<PromotionResponse> getAllPromotions(Pageable pageable);
    List<PromotionResponse> getActivePromotions();
    PromotionCalculationResult previewPromotions(List<String> codes, BigDecimal subtotal, BigDecimal shippingFee, Long userId);
    PromotionCalculationResult calculateAndApplyPromotions(List<String> codes, BigDecimal subtotal, BigDecimal shippingFee, Long userId);
    void toggleStatus(Long id);
}
