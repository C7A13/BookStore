package com.project.BookStore.Inventory.DTO.Response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LowStockBookResponse {
    Long bookId;
    String title;
    Integer stockQuantity;
    Integer reorderPoint;
}
