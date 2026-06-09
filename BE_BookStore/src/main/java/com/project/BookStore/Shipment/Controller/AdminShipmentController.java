package com.project.BookStore.Shipment.Controller;

import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.Shipment.DTO.Request.ShipmentRequest;
import com.project.BookStore.Shipment.DTO.Request.ShipmentStatusRequest;
import com.project.BookStore.Shipment.DTO.Response.ShipmentResponse;
import com.project.BookStore.Shipment.Service.ShipmentService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/shipments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminShipmentController {

    ShipmentService shipmentService;

    @PostMapping
    public ApiResponse<ShipmentResponse> createShipment(@Valid @RequestBody ShipmentRequest request) {
        return ApiResponse.success(
                shipmentService.createShipment(request),
                "Create shipment successfully");
    }

    @PutMapping("/{id}")
    public ApiResponse<ShipmentResponse> updateShipment(
            @PathVariable Long id,
            @Valid @RequestBody ShipmentRequest request) {
        return ApiResponse.success(
                shipmentService.updateShipment(id, request),
                "Update shipment successfully");
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<ShipmentResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ShipmentStatusRequest request) {
        return ApiResponse.success(
                shipmentService.updateStatus(id, request),
                "Update shipment status successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<ShipmentResponse> getShipmentById(@PathVariable Long id) {
        return ApiResponse.success(
                shipmentService.getShipmentById(id),
                "Get shipment details successfully");
    }

    @GetMapping
    public ApiResponse<PageResponse<ShipmentResponse>> getAllShipments(
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return ApiResponse.success(
                shipmentService.getAllShipments(page, size, status),
                "Get all shipments successfully");
    }
}
