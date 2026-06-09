package com.project.BookStore.Review.DTO.Response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReviewResponse {

    Long id;

    Long bookId;
    String bookTitle;
    String bookCover;

    Long userId;
    String userName;
    String fullName;

    Long orderId;

    Integer rating;
    String title;
    String body;

    Boolean isVerified;
    Boolean isVisible;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
