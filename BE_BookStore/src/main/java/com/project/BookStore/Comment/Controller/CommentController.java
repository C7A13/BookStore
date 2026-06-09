package com.project.BookStore.Comment.Controller;

import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.Comment.DTO.Request.CommentCreateRequest;
import com.project.BookStore.Comment.DTO.Request.CommentUpdateRequest;
import com.project.BookStore.Comment.DTO.Response.CommentResponse;
import com.project.BookStore.Comment.Service.CommentServiceImpl;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CommentController {

    CommentServiceImpl commentService;

    @PostMapping
    public ApiResponse<CommentResponse> create(@Valid @RequestBody CommentCreateRequest request) {
        return ApiResponse.success(
                commentService.create(request),
                "Comment created successfully"
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<CommentResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody CommentUpdateRequest request
    ) {
        return ApiResponse.success(
                commentService.update(id, request),
                "Comment updated successfully"
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        commentService.delete(id);
        return ApiResponse.success("Comment deleted successfully");
    }

    @GetMapping("/book/{bookId}")
    public ApiResponse<PageResponse<CommentResponse>> getByBook(
            @PathVariable Long bookId,
            Pageable pageable
    ) {
        return ApiResponse.success(
                commentService.getByBook(bookId, pageable),
                "Get comments successfully"
        );
    }
}
