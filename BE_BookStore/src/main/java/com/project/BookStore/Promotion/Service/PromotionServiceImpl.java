package com.project.BookStore.Promotion.Service;

import com.project.BookStore.Auth.Security.UserContextService;
import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.Promotion.DTO.Request.PromotionRequest;
import com.project.BookStore.Promotion.DTO.Response.PromotionCalculationResult;
import com.project.BookStore.Promotion.DTO.Response.PromotionResponse;
import com.project.BookStore.Promotion.Entity.Promotion;
import com.project.BookStore.Promotion.Enum.PromotionType;
import com.project.BookStore.Promotion.Mapper.PromotionMapper;
import com.project.BookStore.Promotion.Repository.PromotionRepository;
import com.project.BookStore.Promotion.Repository.PromotionUsageRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PromotionServiceImpl implements PromotionService {

    PromotionRepository promotionRepository;
    PromotionUsageRepository promotionUsageRepository;
    PromotionMapper promotionMapper;
    UserContextService userContextService;

    @Override
    @Transactional
    public PromotionResponse createPromotion(PromotionRequest request) {
        if (promotionRepository.findByCodeAndDeletedAtIsNull(request.getCode()).isPresent()) {
            throw new AppException(ErrorCode.PROMOTION_CODE_EXISTS);
        }

        Promotion promotion = promotionMapper.toEntity(request);
        
        if (promotion.getIsActive() == null) promotion.setIsActive(true);
        if (promotion.getUsedCount() == null) promotion.setUsedCount(0);
        if (promotion.getUsagePerCustomer() == null) promotion.setUsagePerCustomer(1);
        if (promotion.getMinOrderValue() == null) promotion.setMinOrderValue(BigDecimal.ZERO);
        
        promotion = promotionRepository.save(promotion);
        return promotionMapper.toResponse(promotion);
    }

    @Override
    @Transactional
    public PromotionResponse updatePromotion(Long id, PromotionRequest request) {
        Promotion promotion = promotionRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));

        if (!promotion.getCode().equals(request.getCode()) &&
                promotionRepository.findByCodeAndDeletedAtIsNull(request.getCode()).isPresent()) {
            throw new AppException(ErrorCode.PROMOTION_CODE_EXISTS);
        }

        promotionMapper.updateEntityFromRequest(request, promotion);
        promotion = promotionRepository.save(promotion);
        return promotionMapper.toResponse(promotion);
    }

    @Override
    @Transactional
    public void deletePromotion(Long id) {
        Promotion promotion = promotionRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        promotion.setDeletedAt(LocalDateTime.now());
        Long currentUserId = userContextService.getCurrentUserId();
        promotionRepository.save(promotion);
    }

    @Override
    public PromotionResponse getPromotionById(Long id) {
        Promotion promotion = promotionRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        return promotionMapper.toResponse(promotion);
    }

    @Override
    public PageResponse<PromotionResponse> getAllPromotions( Pageable pageable) {
        int pageNumber = pageable.getPageNumber() - 1;
        Page<Promotion> page = promotionRepository.findAllByDeletedAtIsNull(pageable);
        
        List<PromotionResponse> data = page.getContent().stream()
                .map(promotionMapper::toResponse)
                .collect(Collectors.toList());
                
        return PageResponse.<PromotionResponse>builder()
                .data(data)
                .page(page.getNumber() + 1)
                .size(page.getSize())
                .total(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    public List<PromotionResponse> getActivePromotions() {
        return promotionRepository.findActivePromotions(LocalDateTime.now())
                .stream()
                .map(promotionMapper::toResponse)
                .collect(Collectors.toList());
    }

    public PromotionCalculationResult previewPromotions(List<String> codes, BigDecimal subtotal, BigDecimal shippingFee, Long userId) {
        List<Promotion> promotions = validateAndGetPromotions(codes);
        if (promotions.isEmpty()) {
            return new PromotionCalculationResult(BigDecimal.ZERO, new ArrayList<>());
        }

        BigDecimal totalDiscount = BigDecimal.ZERO;
        LocalDateTime now = LocalDateTime.now();
        List<Promotion> appliedPromotions = new ArrayList<>();

        for (Promotion promotion : promotions) {
            // Kiểm tra các điều kiện hợp lệ
            validatePromotionConditions(promotion, subtotal, userId, now);

            // CHỈ tính toán số tiền giảm, KHÔNG gọi hàm incrementUsedCount
            BigDecimal discount = promotion.calculateDiscount(subtotal, shippingFee);
            totalDiscount = totalDiscount.add(discount);
            appliedPromotions.add(promotion);
        }

        return new PromotionCalculationResult(totalDiscount, appliedPromotions);
    }


    @Transactional // Đảm bảo tính toàn vẹn dữ liệu khi tạo đơn hàng
    public PromotionCalculationResult calculateAndApplyPromotions(List<String> codes, BigDecimal subtotal, BigDecimal shippingFee, Long userId) {
        List<Promotion> promotions = validateAndGetPromotions(codes);
        if (promotions.isEmpty()) {
            return new PromotionCalculationResult(BigDecimal.ZERO, new ArrayList<>());
        }

        BigDecimal totalDiscount = BigDecimal.ZERO;
        LocalDateTime now = LocalDateTime.now();
        List<Promotion> appliedPromotions = new ArrayList<>();

        for (Promotion promotion : promotions) {
            // Kiểm tra các điều kiện hợp lệ
            validatePromotionConditions(promotion, subtotal, userId, now);

            // THỰC SỰ TRỪ SỐ LƯỢNG MÃ TRONG DB (Chỉ hàm apply mới có)
            int updated = promotionRepository.incrementUsedCountIfAvailable(promotion.getId());
            if (updated == 0) {
                throw new AppException(ErrorCode.PROMOTION_USAGE_LIMIT_EXCEEDED);
            }

            // Tính toán số tiền giảm chính thức để lưu vào hóa đơn
            BigDecimal discount = promotion.calculateDiscount(subtotal, shippingFee);
            totalDiscount = totalDiscount.add(discount);
            appliedPromotions.add(promotion);
        }

        return new PromotionCalculationResult(totalDiscount, appliedPromotions);
    }

    // ==========================================
    // CÁC HÀM BỔ TRỢ (PRIVATE HELPER METHODS) ĐỂ TRÁNH LẶP CODE
    // ==========================================

    /**
     * Kiểm tra số lượng mã và quy tắc gộp mã (Tối đa 1 mã giảm giá + 1 mã freeship)
     */
    private List<Promotion> validateAndGetPromotions(List<String> codes) {
        if (codes == null || codes.isEmpty()) {
            return new ArrayList<>();
        }

        if (codes.size() > 2) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        List<Promotion> promotions = promotionRepository.findByCodesAndDeletedAtIsNull(codes);
        if (promotions.size() != codes.size()) {
            throw new AppException(ErrorCode.PROMOTION_NOT_FOUND);
        }

        int countDiscount = 0;
        int countFreeship = 0;

        for (Promotion p : promotions) {
            if (p.getType() == PromotionType.FREE_SHIPPING) {
                countFreeship++;
            } else {
                countDiscount++;
            }
        }

        if (countDiscount > 1 || countFreeship > 1) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        return promotions;
    }

    /**
     * Kiểm tra hạn sử dụng, giá trị đơn hàng tối thiểu và giới hạn của từng User
     */
    private void validatePromotionConditions(Promotion promotion, BigDecimal subtotal, Long userId, LocalDateTime now) {
        // 1. Check hạn sử dụng
        if (!promotion.getIsActive() ||
                (promotion.getValidFrom() != null && now.isBefore(promotion.getValidFrom())) ||
                (promotion.getValidTo() != null && now.isAfter(promotion.getValidTo()))) {
            throw new AppException(ErrorCode.PROMOTION_EXPIRED);
        }

        // 2. Check giá trị đơn hàng tối thiểu
        if (promotion.getMinOrderValue().compareTo(subtotal) > 0) {
            throw new AppException(ErrorCode.PROMOTION_MIN_ORDER_NOT_MET);
        }

        // 3. Check giới hạn lượt dùng của khách hàng này
        if (userId != null) {
            int usedByUser = promotionUsageRepository.countByPromotionIdAndUserId(promotion.getId(), userId);
            if (usedByUser >= promotion.getUsagePerCustomer()) {
                throw new AppException(ErrorCode.PROMOTION_CUSTOMER_LIMIT_EXCEEDED);
            }
        }
    }

    @Override
    @Transactional
    public void toggleStatus(Long id) {
        Promotion promotion = promotionRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.PROMOTION_NOT_FOUND));
        promotion.setIsActive(!promotion.getIsActive());
        promotionRepository.save(promotion);
    }
}

