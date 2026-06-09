package com.project.BookStore.Inventory.DTO.Request;

import com.project.BookStore.Inventory.Enum.InventoryLogType;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryAdjustmentRequest {

    @NotNull
    Long bookId;

    @NotNull
    Integer changeQty;

    InventoryLogType type = InventoryLogType.ADJUSTMENT;

    Long referenceId;

    String note;
}
