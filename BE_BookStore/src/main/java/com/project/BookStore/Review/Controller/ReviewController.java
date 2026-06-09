package com.project.BookStore.Review.Controller;

import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.Review.DTO.Request.ReviewCreateRequest;
import com.project.BookStore.Review.DTO.Request.ReviewUpdateRequest;
import com.project.BookStore.Review.DTO.Response.ReviewResponse;
import com.project.BookStore.Review.Service.ReviewServiceImpl;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewController {

    ReviewServiceImpl reviewService;

    @PostMapping
    public ApiResponse<ReviewResponse> create(@Valid @RequestBody ReviewCreateRequest request) {
        return ApiResponse.success(
                reviewService.create(request),
                "Review created successfully"
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<ReviewResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody ReviewUpdateRequest request
    ) {
        return ApiResponse.success(
                reviewService.update(id, request),
                "Review updated successfully"
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        reviewService.delete(id);
        return ApiResponse.success("Review deleted successfully");
    }

    @GetMapping("/book/{bookId}")
    public ApiResponse<PageResponse<ReviewResponse>> getByBook(
            @PathVariable Long bookId,
            Pageable pageable
    ) {
        return ApiResponse.success(
                reviewService.getByBook(bookId, pageable),
                "Get reviews successfully"
        );
    }

    @GetMapping("/my")
    public ApiResponse<PageResponse<ReviewResponse>> getMyReviews(Pageable pageable) {
        return ApiResponse.success(
                reviewService.getMyReviews(pageable),
                "Get my reviews successfully"
        );
    }

    @GetMapping("/book/{bookId}/summary")
    public ApiResponse<Map<String, Object>> getBookRatingSummary(@PathVariable Long bookId) {
        Double avgRating = reviewService.getAverageRating(bookId);
        Long count = reviewService.getReviewCount(bookId);

        return ApiResponse.success(
                Map.of(
                        "avgRating", avgRating != null ? avgRating : 0.0,
                        "reviewCount", count
                ),
                "Get rating summary successfully"
        );
    }
}
