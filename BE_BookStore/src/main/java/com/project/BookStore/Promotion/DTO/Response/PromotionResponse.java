package com.project.BookStore.Promotion.DTO.Response;

import com.project.BookStore.Promotion.Enum.PromotionType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PromotionResponse {
    Long id;
    String code;
    String name;
    PromotionType type;
    BigDecimal value;
    BigDecimal maxDiscount;
    BigDecimal minOrderValue;
    Integer usageLimit;
    Integer usagePerCustomer;
    Integer usedCount;
    Boolean isActive;
    LocalDateTime validFrom;
    LocalDateTime validTo;
}
