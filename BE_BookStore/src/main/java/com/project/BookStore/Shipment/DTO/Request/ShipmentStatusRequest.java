package com.project.BookStore.Shipment.DTO.Request;

import com.project.BookStore.Shipment.Enum.ShipmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;



@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ShipmentStatusRequest {
    @NotNull(message = "Status is required")
    ShipmentStatus status;
}
