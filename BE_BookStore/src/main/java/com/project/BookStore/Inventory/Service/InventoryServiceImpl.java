package com.project.BookStore.Inventory.Service;

import com.project.BookStore.Auth.Security.UserContextService;
import com.project.BookStore.Book.Entity.Book;
import com.project.BookStore.Book.Repository.BookRepository;
import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.Inventory.DTO.Request.InventoryAdjustmentRequest;
import com.project.BookStore.Inventory.DTO.Response.InventoryLogResponse;
import com.project.BookStore.Inventory.DTO.Response.LowStockBookResponse;
import com.project.BookStore.Inventory.Entity.InventoryLog;
import com.project.BookStore.Inventory.Enum.InventoryLogType;
import com.project.BookStore.Inventory.Repository.InventoryLogRepository;
import com.project.BookStore.Order.Entity.Order;
import com.project.BookStore.Order.Entity.OrderItem;
import com.project.BookStore.User.Entity.User;
import com.project.BookStore.User.Repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InventoryServiceImpl implements InventoryService {

    InventoryLogRepository inventoryLogRepository;
    BookRepository bookRepository;
    UserRepository userRepository;
    UserContextService userContextService;

    @Override
    public PageResponse<InventoryLogResponse> getLogs(Pageable pageable) {
        Page<InventoryLog> page = inventoryLogRepository.findAllByOrderByCreatedAtDesc(pageable);
        return toPageResponse(page);
    }

    @Override
    public PageResponse<InventoryLogResponse> getLogsByBook(Long bookId, Pageable pageable) {
        if (!bookRepository.existsById(bookId)) {
            throw new AppException(ErrorCode.BOOK_NOT_FOUND);
        }

        Page<InventoryLog> page = inventoryLogRepository.findByBookIdOrderByCreatedAtDesc(bookId, pageable);
        return toPageResponse(page);
    }

    @Override
    public PageResponse<LowStockBookResponse> getLowStockBooks(Pageable pageable) {
        Page<Book> page = bookRepository.findLowStock(pageable);
        List<LowStockBookResponse> data = page.getContent().stream()
                .map(book -> LowStockBookResponse.builder()
                        .bookId(book.getId())
                        .title(book.getTitle())
                        .stockQuantity(book.getStockQuantity())
                        .reorderPoint(book.getReorderPoint())
                        .build())
                .toList();

        return PageResponse.<LowStockBookResponse>builder()
                .data(data)
                .page(page.getNumber() + 1)
                .size(page.getSize())
                .total(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    public InventoryLogResponse adjustStock(InventoryAdjustmentRequest request) {
        Long currentUserId = userContextService.getRequiredUserId();
        InventoryLogType type = request.getType() == null ? InventoryLogType.ADJUSTMENT : request.getType();
        InventoryLog log = changeStockAndSaveLog(
                request.getBookId(),
                request.getChangeQty(),
                type,
                request.getReferenceId(),
                request.getNote(),
                currentUserId);
        return toResponse(log);
    }

    @Override
    @Transactional
    public void recordStockChange(Long bookId, int changeQty, InventoryLogType type, Long referenceId, String note, Long createdById) {
        changeStockAndSaveLog(bookId, changeQty, type, referenceId, note, createdById);
    }

    @Override
    @Transactional
    public void recordSale(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            if (item.getBook() != null) {
                saveLog(item.getBook(), -item.getQuantity(), InventoryLogType.SALE, order.getId(), null, null);
            }
        }
    }

    @Override
    @Transactional
    public void recordReturn(Order order) {
        for (OrderItem item : order.getOrderItems()) {
            if (item.getBook() != null) {
                saveLog(item.getBook(), item.getQuantity(), InventoryLogType.RETURN, order.getId(), "Restore stock after order cancellation", null);
            }
        }
    }

    private InventoryLog changeStockAndSaveLog(Long bookId, Integer changeQty, InventoryLogType type, Long referenceId, String note, Long createdById) {
        if (changeQty == null || changeQty == 0) {
            throw new AppException(ErrorCode.INVALID_INVENTORY_QUANTITY);
        }

        Book book = bookRepository.findByIdAndDeletedAtIsNull(bookId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        if (changeQty < 0) {
            int updatedRows = bookRepository.decreaseStockIfAvailable(bookId, Math.abs(changeQty));
            if (updatedRows == 0) {
                throw new AppException(ErrorCode.OUT_OF_STOCK);
            }
        } else {
            bookRepository.increaseStock(bookId, changeQty);
        }

        return saveLog(book, changeQty, type, referenceId, note, createdById);
    }

    private InventoryLog saveLog(Book book, int changeQty, InventoryLogType type, Long referenceId, String note, Long createdById) {
        User createdBy = null;
        if (createdById != null) {
            createdBy = userRepository.findById(createdById)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        }

        InventoryLog log = InventoryLog.builder()
                .book(book)
                .changeQty(changeQty)
                .type(type == null ? InventoryLogType.ADJUSTMENT : type)
                .referenceId(referenceId)
                .note(note)
                .createdBy(createdBy)
                .build();

        return inventoryLogRepository.save(log);
    }

    private PageResponse<InventoryLogResponse> toPageResponse(Page<InventoryLog> page) {
        return PageResponse.<InventoryLogResponse>builder()
                .data(page.getContent().stream().map(this::toResponse).toList())
                .page(page.getNumber() + 1)
                .size(page.getSize())
                .total(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    private InventoryLogResponse toResponse(InventoryLog log) {
        Book book = log.getBook();
        User createdBy = log.getCreatedBy();

        return InventoryLogResponse.builder()
                .id(log.getId())
                .bookId(book == null ? null : book.getId())
                .bookTitle(book == null ? null : book.getTitle())
                .changeQty(log.getChangeQty())
                .type(log.getType())
                .referenceId(log.getReferenceId())
                .note(log.getNote())
                .createdById(createdBy == null ? null : createdBy.getId())
                .createdByName(createdBy == null ? null : createdBy.getFullName())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
