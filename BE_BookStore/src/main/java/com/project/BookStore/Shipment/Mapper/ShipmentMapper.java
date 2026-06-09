package com.project.BookStore.Shipment.Mapper;

import com.project.BookStore.Shipment.DTO.Request.ShipmentRequest;
import com.project.BookStore.Shipment.DTO.Response.ShipmentResponse;
import com.project.BookStore.Shipment.Entity.Shipment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;


@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ShipmentMapper {

    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "orderCode", source = "order.code")
    ShipmentResponse toResponse(Shipment shipment);

    @Mapping(target = "status", ignore = true)
    @Mapping(target = "shippedAt", ignore = true)
    @Mapping(target = "deliveredAt", ignore = true)
    Shipment toEntity(ShipmentRequest request);

    @Mapping(target = "order", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "shippedAt", ignore = true)
    @Mapping(target = "deliveredAt", ignore = true)
    void updateEntity(@MappingTarget Shipment shipment, ShipmentRequest request);
}

