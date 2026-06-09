package com.project.BookStore.Comment.DTO.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentCreateRequest {

    @NotNull(message = "Book ID is required")
    Long bookId;

    Long parentId; // Nullable, only specified if this is a reply

    @NotBlank(message = "Comment body cannot be blank")
    @Size(max = 1000, message = "Comment must not exceed 1000 characters")
    String body;
}
