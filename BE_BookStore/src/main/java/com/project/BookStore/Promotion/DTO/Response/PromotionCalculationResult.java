package com.project.BookStore.Promotion.DTO.Response;

import com.project.BookStore.Promotion.Entity.Promotion;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PromotionCalculationResult {
    BigDecimal totalDiscount;
    List<Promotion> appliedPromotions;
}
