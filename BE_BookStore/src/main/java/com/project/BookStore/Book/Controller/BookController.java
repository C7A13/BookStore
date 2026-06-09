package com.project.BookStore.Book.Controller;

import com.project.BookStore.Book.DTO.Request.BookFilterRequest;
import com.project.BookStore.Book.DTO.Response.BookDetailResponse;
import com.project.BookStore.Book.DTO.Response.BookListResponse;
import com.project.BookStore.Book.Service.BookService;
import com.project.BookStore.Book.Service.BookServiceImpl;
import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Common.Response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
public class BookController {

    private final BookServiceImpl bookService;

    @GetMapping
    public ApiResponse<PageResponse<BookListResponse>> getList(
            BookFilterRequest filter,
            Pageable pageable
    ) {
        return ApiResponse.success(
                bookService.getList(filter, pageable),
                "Get books successfully"
        );
    }

    @GetMapping("/{slug}")
    public ApiResponse<BookDetailResponse> getDetail(@PathVariable String slug) {
        return ApiResponse.success(
                bookService.getDetail(slug),
                "Get book detail successfully"
        );
    }

    @GetMapping("/search")
    public ApiResponse<PageResponse<BookListResponse>> search(
            @RequestParam String keyword,
            Pageable pageable
    ) {
        return ApiResponse.success(
                bookService.search(keyword, pageable),
                "Search books successfully"
        );
    }

    @GetMapping("/{bookId}/related")
    public ApiResponse<List<BookListResponse>> getRelated(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "8") int limit
    ) {
        return ApiResponse.success(
                bookService.getRelated(bookId, limit),
                "Get related books successfully"
        );
    }

    @GetMapping("/on-sale")
    public ApiResponse<PageResponse<BookListResponse>> getOnSale(Pageable pageable) {
        return ApiResponse.success(
                bookService.getOnSale(pageable),
                "Get sale books successfully"
        );
    }
    @GetMapping("/category/{slug}")
    public ApiResponse<PageResponse<BookListResponse>> getByCategorySlug(
            @PathVariable String slug,
            Pageable pageable
    ) {
        return ApiResponse.success(
                bookService.getBooksByCategorySlug(slug, pageable),
                "Get books by category successfully"
        );
    }
}