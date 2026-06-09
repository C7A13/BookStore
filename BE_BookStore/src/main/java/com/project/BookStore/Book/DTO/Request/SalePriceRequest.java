package com.project.BookStore.Book.DTO.Request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SalePriceRequest {

    @NotNull
    @Min(value = 1000, message = "Sale price must be at least 1,000 VNĐ")
    private BigDecimal salePrice;

    @NotNull
    private LocalDateTime saleFrom;

    @NotNull
    private LocalDateTime saleTo;
}
