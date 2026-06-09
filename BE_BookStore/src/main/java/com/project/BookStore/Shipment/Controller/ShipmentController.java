package com.project.BookStore.Shipment.Controller;

import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Shipment.DTO.Response.ShipmentResponse;
import com.project.BookStore.Shipment.Service.ShipmentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shipments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ShipmentController {

    ShipmentService shipmentService;

    @GetMapping
    public ApiResponse<List<ShipmentResponse>> getMyShipments() {
        return ApiResponse.success(
                shipmentService.getMyShipments(),
                "Get my shipments successfully");
    }

    @GetMapping("/order/{orderId}")
    public ApiResponse<ShipmentResponse> getShipmentByOrderId(@PathVariable Long orderId) {
        return ApiResponse.success(
                shipmentService.getShipmentByOrderId(orderId),
                "Get shipment by order ID successfully");
    }
}
