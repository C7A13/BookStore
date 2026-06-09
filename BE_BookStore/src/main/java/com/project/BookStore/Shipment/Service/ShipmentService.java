package com.project.BookStore.Shipment.Service;

import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.Shipment.DTO.Request.ShipmentRequest;
import com.project.BookStore.Shipment.DTO.Request.ShipmentStatusRequest;
import com.project.BookStore.Shipment.DTO.Response.ShipmentResponse;

import java.util.List;

public interface ShipmentService {
    ShipmentResponse createShipment(ShipmentRequest request);
    ShipmentResponse updateShipment(Long id, ShipmentRequest request);
    ShipmentResponse updateStatus(Long id, ShipmentStatusRequest request);
    ShipmentResponse getShipmentById(Long id);
    ShipmentResponse getShipmentByOrderId(Long orderId);
    PageResponse<ShipmentResponse> getAllShipments(int page, int size, String status);
    List<ShipmentResponse> getMyShipments();
}
