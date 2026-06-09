package com.project.BookStore.Comment.DTO.Response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentResponse {

    Long id;

    Long bookId;
    String bookTitle;

    Long userId;
    String userName;
    String fullName;

    Long parentId;
    String body;
    Boolean isVisible;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    List<CommentResponse> replies;
}
