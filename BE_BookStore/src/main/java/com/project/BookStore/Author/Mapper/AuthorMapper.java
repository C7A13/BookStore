package com.project.BookStore.Author.Mapper;

import com.project.BookStore.Author.DTO.Request.AuthorRequest;
import com.project.BookStore.Author.DTO.Response.AuthorResponse;
import com.project.BookStore.Author.Entity.Author;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AuthorMapper {


    @Mapping(target = "isDeleted", expression = "java(author.getDeletedAt() != null)")
    AuthorResponse toResponse(Author author);

    List<AuthorResponse> toResponseList(List<Author> authors);
    Author toEntity(AuthorRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateAuthor(@MappingTarget Author author, AuthorRequest request);
}
