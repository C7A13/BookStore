package com.project.BookStore.Review.Mapper;

import com.project.BookStore.Review.DTO.Request.ReviewUpdateRequest;
import com.project.BookStore.Review.DTO.Response.ReviewResponse;
import com.project.BookStore.Review.Entity.Review;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        builder = @Builder(disableBuilder = true)
)
public interface ReviewMapper {

    @Mapping(target = "bookCover", source = "book.coverImage")
    @Mapping(target = "bookId", source = "book.id")
    @Mapping(target = "bookTitle", source = "book.title")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.userName")
    @Mapping(target = "fullName", source = "user.fullName")
    @Mapping(target = "orderId", source = "order.id")
    ReviewResponse toResponse(Review review);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "book", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "order", ignore = true)
    @Mapping(target = "isVerified", ignore = true)
    @Mapping(target = "isVisible", ignore = true)
    void updateEntity(@MappingTarget Review review, ReviewUpdateRequest request);
}
