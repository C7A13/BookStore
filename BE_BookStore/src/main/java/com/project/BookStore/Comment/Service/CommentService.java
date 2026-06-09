package com.project.BookStore.Comment.Service;

import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.Comment.DTO.Request.CommentCreateRequest;
import com.project.BookStore.Comment.DTO.Request.CommentUpdateRequest;
import com.project.BookStore.Comment.DTO.Response.CommentResponse;
import org.springframework.data.domain.Pageable;

public interface CommentService {

    // ========== Public / User ==========

    CommentResponse create(CommentCreateRequest request);

    CommentResponse update(Long id, CommentUpdateRequest request);

    void delete(Long id);

    PageResponse<CommentResponse> getByBook(Long bookId, Pageable pageable);

    // ========== Admin ==========

    PageResponse<CommentResponse> adminGetByBook(Long bookId, Pageable pageable);

    void toggleVisibility(Long id);
}
