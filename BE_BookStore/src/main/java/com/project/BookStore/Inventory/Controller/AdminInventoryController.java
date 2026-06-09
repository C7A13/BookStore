package com.project.BookStore.Inventory.Controller;

import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.Inventory.DTO.Request.InventoryAdjustmentRequest;
import com.project.BookStore.Inventory.DTO.Response.InventoryLogResponse;
import com.project.BookStore.Inventory.DTO.Response.LowStockBookResponse;
import com.project.BookStore.Inventory.Service.InventoryService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/inventory")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminInventoryController {

    InventoryService inventoryService;

    @GetMapping("/logs")
    public ApiResponse<PageResponse<InventoryLogResponse>> getLogs(Pageable pageable) {
        return ApiResponse.success(inventoryService.getLogs(pageable), "Inventory logs retrieved successfully");
    }

    @GetMapping("/books/{bookId}/logs")
    public ApiResponse<PageResponse<InventoryLogResponse>> getLogsByBook(@PathVariable Long bookId, Pageable pageable) {
        return ApiResponse.success(inventoryService.getLogsByBook(bookId, pageable), "Book inventory logs retrieved successfully");
    }

    @GetMapping("/low-stock")
    public ApiResponse<PageResponse<LowStockBookResponse>> getLowStockBooks(Pageable pageable) {
        return ApiResponse.success(inventoryService.getLowStockBooks(pageable), "Low stock books retrieved successfully");
    }

    @PostMapping("/adjustments")
    public ApiResponse<InventoryLogResponse> adjustStock(@RequestBody @Valid InventoryAdjustmentRequest request) {
        return ApiResponse.success(inventoryService.adjustStock(request), "Stock adjusted successfully");
    }
}
