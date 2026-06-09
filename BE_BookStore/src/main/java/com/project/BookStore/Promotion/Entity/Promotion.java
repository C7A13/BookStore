package com.project.BookStore.Promotion.Entity;

import com.project.BookStore.Common.Entity.BaseEntity;
import com.project.BookStore.Promotion.Enum.PromotionType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "promotions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Promotion extends BaseEntity {

    @Column(name = "code", nullable = false, unique = true, length = 50)
    String code;

    @Column(name = "name", nullable = false, length = 150)
    String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    PromotionType type;

    @Column(name = "value", nullable = false, precision = 12, scale = 2)
    BigDecimal value;

    @Column(name = "max_discount", precision = 12, scale = 2)
    BigDecimal maxDiscount;

    @Builder.Default
    @Column(name = "min_order_value", nullable = false, precision = 12, scale = 2)
    BigDecimal minOrderValue = BigDecimal.ZERO;

    @Column(name = "usage_limit")
    Integer usageLimit;

    @Builder.Default
    @Column(name = "usage_per_customer", nullable = false)
    Integer usagePerCustomer = 1;

    @Builder.Default
    @Column(name = "used_count", nullable = false)
    Integer usedCount = 0;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    Boolean isActive = true;

    @Column(name = "valid_from")
    LocalDateTime validFrom;

    @Column(name = "valid_to")
    LocalDateTime validTo;

    public BigDecimal calculateDiscount(BigDecimal subtotal, BigDecimal shippingFee) {
        BigDecimal discount = BigDecimal.ZERO;
        
        switch (this.type) {
            case PERCENT:
                discount = subtotal.multiply(this.value).divide(BigDecimal.valueOf(100));
                if (this.maxDiscount != null && discount.compareTo(this.maxDiscount) > 0) {
                    discount = this.maxDiscount;
                }
                break;
            case FIXED_AMOUNT:
                discount = this.value;
                if (discount.compareTo(subtotal) > 0) {
                    discount = subtotal; // Cannot discount more than the order subtotal
                }
                break;
            case FREE_SHIPPING:
                // Cap the free shipping discount to the maxDiscount if specified, otherwise the whole shipping fee
                discount = shippingFee;
                if (this.maxDiscount != null && discount.compareTo(this.maxDiscount) > 0) {
                    discount = this.maxDiscount;
                }
                break;
        }
        
        return discount;
    }
}
