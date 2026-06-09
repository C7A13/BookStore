package com.project.BookStore.Comment.Mapper;

import com.project.BookStore.Comment.DTO.Request.CommentUpdateRequest;
import com.project.BookStore.Comment.DTO.Response.CommentResponse;
import com.project.BookStore.Comment.Entity.Comment;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        builder = @Builder(disableBuilder = true)
)
public interface CommentMapper {

    @Mapping(target = "bookId", source = "book.id")
    @Mapping(target = "bookTitle", source = "book.title")
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.userName")
    @Mapping(target = "fullName", source = "user.fullName")
    @Mapping(target = "parentId", source = "parent.id")
    CommentResponse toResponse(Comment comment);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "book", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "replies", ignore = true)
    @Mapping(target = "isVisible", ignore = true)
    void updateEntity(@MappingTarget Comment comment, CommentUpdateRequest request);
}
