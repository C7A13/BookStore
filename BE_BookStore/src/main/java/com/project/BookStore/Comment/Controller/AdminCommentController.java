package com.project.BookStore.Comment.Controller;

import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.Comment.DTO.Response.CommentResponse;
import com.project.BookStore.Comment.Service.CommentServiceImpl;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/comments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminCommentController {

    CommentServiceImpl commentService;

    @GetMapping("/book/{bookId}")
    public ApiResponse<PageResponse<CommentResponse>> getByBook(
            @PathVariable Long bookId,
            Pageable pageable
    ) {
        return ApiResponse.success(
                commentService.adminGetByBook(bookId, pageable),
                "Get all comments successfully"
        );
    }

    @PatchMapping("/{id}/visibility")
    public ApiResponse<Void> toggleVisibility(@PathVariable Long id) {
        commentService.toggleVisibility(id);
        return ApiResponse.success("Comment visibility toggled successfully");
    }
}
