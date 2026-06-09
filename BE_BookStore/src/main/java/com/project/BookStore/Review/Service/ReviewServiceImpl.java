package com.project.BookStore.Review.Service;

import com.project.BookStore.Auth.Utils.SecurityUtil;
import com.project.BookStore.Book.Entity.Book;
import com.project.BookStore.Book.Repository.BookRepository;
import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.Order.Entity.Order;
import com.project.BookStore.Order.Enum.OrderStatus;
import com.project.BookStore.Order.Repository.OrderRepository;
import com.project.BookStore.Review.DTO.Request.ReviewCreateRequest;
import com.project.BookStore.Review.DTO.Request.ReviewUpdateRequest;
import com.project.BookStore.Review.DTO.Response.ReviewResponse;
import com.project.BookStore.Review.Entity.Review;
import com.project.BookStore.Review.Mapper.ReviewMapper;
import com.project.BookStore.Review.Repository.ReviewRepository;
import com.project.BookStore.User.Entity.User;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReviewServiceImpl implements ReviewService {

    ReviewRepository reviewRepository;
    BookRepository bookRepository;
    OrderRepository orderRepository;
    ReviewMapper reviewMapper;
    SecurityUtil securityUtil;

    // ========== Public / User ==========

    @Override
    @Transactional
    public ReviewResponse create(ReviewCreateRequest request) {
        User currentUser = securityUtil.getCurrentUser();

        // 1. Kiểm tra book tồn tại
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOK_NOT_FOUND));

        // 2. Kiểm tra order tồn tại và lấy kèm items
        Order order = orderRepository.findByIdWithItems(request.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // 3. Kiểm tra order thuộc về user hiện tại
        if (!order.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.REVIEW_NOT_OWNER);
        }

        // 4. Kiểm tra order đã delivered
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new AppException(ErrorCode.ORDER_NOT_DELIVERED);
        }

        // 5. Kiểm tra book có trong order
        boolean bookInOrder = order.getOrderItems().stream()
                .anyMatch(item -> item.getBook() != null
                        && item.getBook().getId().equals(request.getBookId()));
        if (!bookInOrder) {
            throw new AppException(ErrorCode.BOOK_NOT_IN_ORDER);
        }

        // 6. Kiểm tra chưa review trước đó
        if (reviewRepository.existsByBookIdAndUserIdAndOrderId(
                request.getBookId(), currentUser.getId(), request.getOrderId())) {
            throw new AppException(ErrorCode.REVIEW_ALREADY_EXISTS);
        }

        // 7. Tạo review
        Review review = Review.builder()
                .book(book)
                .user(currentUser)
                .order(order)
                .rating(request.getRating())
                .title(request.getTitle())
                .body(request.getBody())
                .isVerified(true)
                .isVisible(true)
                .build();

        review = reviewRepository.save(review);

        return reviewMapper.toResponse(review);
    }

    @Override
    @Transactional
    public ReviewResponse update(Long id, ReviewUpdateRequest request) {
        User currentUser = securityUtil.getCurrentUser();

        Review review = reviewRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        // Chỉ owner mới được sửa
        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.REVIEW_NOT_OWNER);
        }

        reviewMapper.updateEntity(review, request);
        review = reviewRepository.save(review);

        return reviewMapper.toResponse(review);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        User currentUser = securityUtil.getCurrentUser();

        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        // Chỉ owner mới được xóa
        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new AppException(ErrorCode.REVIEW_NOT_OWNER);
        }

        reviewRepository.delete(review);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getByBook(Long bookId, Pageable pageable) {
        // Kiểm tra book tồn tại
        if (!bookRepository.existsById(bookId)) {
            throw new AppException(ErrorCode.BOOK_NOT_FOUND);
        }

        Page<Review> page = reviewRepository.findByBookIdAndIsVisibleTrue(bookId, pageable);

        return PageResponse.<ReviewResponse>builder()
                .data(page.getContent().stream()
                        .map(reviewMapper::toResponse)
                        .toList())
                .page(page.getNumber())
                .size(page.getSize())
                .total(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getMyReviews(Pageable pageable) {
        Long userId = securityUtil.getCurrentUserId();

        Page<Review> page = reviewRepository.findByUserId(userId, pageable);

        return PageResponse.<ReviewResponse>builder()
                .data(page.getContent().stream()
                        .map(reviewMapper::toResponse)
                        .toList())
                .page(page.getNumber())
                .size(page.getSize())
                .total(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Double getAverageRating(Long bookId) {
        return reviewRepository.getAverageRatingByBookId(bookId);
    }

    @Override
    @Transactional(readOnly = true)
    public Long getReviewCount(Long bookId) {
        return reviewRepository.countByBookIdAndIsVisibleTrue(bookId);
    }

    // ========== Admin ==========

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> adminGetByBook(Long bookId, Pageable pageable) {
        if (!bookRepository.existsById(bookId)) {
            throw new AppException(ErrorCode.BOOK_NOT_FOUND);
        }

        Page<Review> page = reviewRepository.findByBookId(bookId, pageable);

        return PageResponse.<ReviewResponse>builder()
                .data(page.getContent().stream()
                        .map(reviewMapper::toResponse)
                        .toList())
                .page(page.getNumber())
                .size(page.getSize())
                .total(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public PageResponse<ReviewResponse> adminGetAllReviews(Pageable pageable) {
        int pageNumber = pageable.getPageNumber() - 1;
        pageNumber = Math.max(pageNumber, 0);
        org.springframework.data.domain.Pageable safePageable = org.springframework.data.domain.PageRequest.of(
                pageNumber,
                pageable.getPageSize(),
                pageable.getSort()
        );
        Page<Review> page = reviewRepository.findAll(safePageable);
        return PageResponse.<ReviewResponse>builder()
                .data(page.getContent().stream()
                        .map(reviewMapper::toResponse)
                        .toList())
                .page(page.getNumber() + 1)
                .size(page.getSize())
                .total(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    @Transactional
    public void toggleVisibility(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        review.setIsVisible(!review.getIsVisible());
        reviewRepository.save(review);
    }
}
