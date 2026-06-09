package com.project.BookStore.Book.Controller;

import com.project.BookStore.Book.DTO.Request.BookCreateRequest;
import com.project.BookStore.Book.DTO.Request.BookUpdateRequest;
import com.project.BookStore.Book.DTO.Request.SalePriceRequest;
import com.project.BookStore.Book.DTO.Response.BookDetailResponse;
import com.project.BookStore.Book.Service.BookServiceImpl;
import com.project.BookStore.Common.Response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/books")
@RequiredArgsConstructor
public class AdminBookController {

    private final BookServiceImpl bookService;

    @PostMapping
    public ApiResponse<BookDetailResponse> create(
            @Valid @RequestBody BookCreateRequest request) {
        return ApiResponse.success(
                bookService.create(request),
                "Create book successfully");
    }

    @PutMapping("/{id}")
    public ApiResponse<BookDetailResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody BookUpdateRequest request) {
        return ApiResponse.success(
                bookService.update(id, request),
                "Update book successfully");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @PathVariable Long id,
            @RequestParam Long deletedBy) {
        bookService.delete(id, deletedBy);
        return ApiResponse.success(null, "Delete book successfully");
    }

    @PutMapping("/{id}/restore")
    public ApiResponse<Void> restore(@PathVariable Long id) {
        bookService.restore(id);
        return ApiResponse.success(null, "Restore book successfully");
    }

    // ================= SALE =================

    @PutMapping("/{id}/sale")
    public ApiResponse<Void> setSale(
            @PathVariable Long id,
            @RequestBody SalePriceRequest request) {
        bookService.setSalePrice(id, request);
        return ApiResponse.success(null, "Set sale price successfully");
    }

    @DeleteMapping("/{id}/sale")
    public ApiResponse<Void> removeSale(@PathVariable Long id) {
        bookService.removeSalePrice(id);
        return ApiResponse.success(null, "Remove sale price successfully");
    }

    // ================= AUTHOR =================

    @PostMapping("/{bookId}/authors")
    public ApiResponse<Void> addAuthor(
            @PathVariable Long bookId,
            @RequestParam Long authorId,
            @RequestParam(defaultValue = "author") String role) {
        bookService.addAuthor(bookId, authorId, role);
        return ApiResponse.success(null, "Add author successfully");
    }

    @DeleteMapping("/{bookId}/authors/{authorId}")
    public ApiResponse<Void> removeAuthor(
            @PathVariable Long bookId,
            @PathVariable Long authorId) {
        bookService.removeAuthor(bookId, authorId);
        return ApiResponse.success(null, "Remove author successfully");
    }

    // ====================== BookController.java ======================

    @PatchMapping("/{id}/activate")
    public ApiResponse<Void> activate(@PathVariable Long id) {

        bookService.activate(id);

        return ApiResponse.success(
                null,
                "Book activated successfully");
    }

    @PatchMapping("/{id}/deactivate")
    public ApiResponse<Void> deactivate(@PathVariable Long id) {

        bookService.deactivate(id);

        return ApiResponse.success(
                null,
                "Book deactivated successfully");
    }
}