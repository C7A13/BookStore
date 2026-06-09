package com.project.BookStore.Inventory.DTO.Response;

import com.project.BookStore.Inventory.Enum.InventoryLogType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryLogResponse {
    Long id;
    Long bookId;
    String bookTitle;
    Integer changeQty;
    InventoryLogType type;
    Long referenceId;
    String note;
    Long createdById;
    String createdByName;
    LocalDateTime createdAt;
}
