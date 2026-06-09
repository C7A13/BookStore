package com.project.BookStore.Review.Controller;

import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.Review.DTO.Response.ReviewResponse;
import com.project.BookStore.Review.Service.ReviewServiceImpl;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/reviews")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminReviewController {

    ReviewServiceImpl reviewService;

    @GetMapping
    public ApiResponse<PageResponse<ReviewResponse>> getAll(org.springframework.data.domain.Pageable pageable) {
        return ApiResponse.success(
                reviewService.adminGetAllReviews(pageable),
                "Get all reviews successfully"
        );
    }

    @GetMapping("/book/{bookId}")
    public ApiResponse<PageResponse<ReviewResponse>> getByBook(
            @PathVariable Long bookId,
            Pageable pageable
    ) {
        return ApiResponse.success(
                reviewService.adminGetByBook(bookId, pageable),
                "Get all reviews successfully"
        );
    }

    @PatchMapping("/{id}/visibility")
    public ApiResponse<Void> toggleVisibility(@PathVariable Long id) {
        reviewService.toggleVisibility(id);
        return ApiResponse.success("Review visibility toggled successfully");
    }
}
