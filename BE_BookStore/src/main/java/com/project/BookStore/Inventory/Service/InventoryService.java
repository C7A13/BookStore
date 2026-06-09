package com.project.BookStore.Inventory.Service;

import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.Inventory.DTO.Request.InventoryAdjustmentRequest;
import com.project.BookStore.Inventory.DTO.Response.InventoryLogResponse;
import com.project.BookStore.Inventory.DTO.Response.LowStockBookResponse;
import com.project.BookStore.Inventory.Enum.InventoryLogType;
import com.project.BookStore.Order.Entity.Order;
import org.springframework.data.domain.Pageable;

public interface InventoryService {
    PageResponse<InventoryLogResponse> getLogs(Pageable pageable);

    PageResponse<InventoryLogResponse> getLogsByBook(Long bookId, Pageable pageable);

    PageResponse<LowStockBookResponse> getLowStockBooks(Pageable pageable);

    InventoryLogResponse adjustStock(InventoryAdjustmentRequest request);

    void recordStockChange(Long bookId, int changeQty, InventoryLogType type, Long referenceId, String note, Long createdById);

    void recordSale(Order order);

    void recordReturn(Order order);
}
