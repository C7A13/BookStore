package com.project.BookStore.Review.Service;

import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.Review.DTO.Request.ReviewCreateRequest;
import com.project.BookStore.Review.DTO.Request.ReviewUpdateRequest;
import com.project.BookStore.Review.DTO.Response.ReviewResponse;
import org.springframework.data.domain.Pageable;

public interface ReviewService {

    // ========== Public / User ==========

    ReviewResponse create(ReviewCreateRequest request);

    ReviewResponse update(Long id, ReviewUpdateRequest request);

    void delete(Long id);

    PageResponse<ReviewResponse> getByBook(Long bookId, Pageable pageable);

    PageResponse<ReviewResponse> getMyReviews(Pageable pageable);

    Double getAverageRating(Long bookId);

    Long getReviewCount(Long bookId);

    // ========== Admin ==========

    PageResponse<ReviewResponse> adminGetAllReviews(Pageable pageable);

    PageResponse<ReviewResponse> adminGetByBook(Long bookId, Pageable pageable);

    void toggleVisibility(Long id);
}
