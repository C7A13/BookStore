package com.project.BookStore.Comment.DTO.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentUpdateRequest {

    @NotBlank(message = "Comment body cannot be blank")
    @Size(max = 1000, message = "Comment must not exceed 1000 characters")
    String body;
}
