package com.project.BookStore.Promotion.DTO.Request;

import com.project.BookStore.Promotion.Enum.PromotionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PromotionRequest {
    @NotNull(message = "Code cannot be null")
    String code;

    @NotNull(message = "Name cannot be null")
    String name;

    @NotNull(message = "Type cannot be null")
    PromotionType type;

    @NotNull(message = "Value cannot be null")
    @Min(value = 0, message = "Value cannot be negative")
    BigDecimal value;

    BigDecimal maxDiscount;

    @NotNull(message = "Min order value cannot be null")
    @Min(value = 0, message = "Min order value cannot be negative")
    BigDecimal minOrderValue;

    Integer usageLimit;

    @NotNull(message = "Usage per customer cannot be null")
    @Min(value = 1, message = "Usage per customer must be at least 1")
    Integer usagePerCustomer;

    LocalDateTime validFrom;
    LocalDateTime validTo;
}
