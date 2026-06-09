package com.project.BookStore.Author.Service;

import com.project.BookStore.Author.DTO.Request.AuthorRequest;
import com.project.BookStore.Author.DTO.Response.AuthorResponse;
import com.project.BookStore.Common.Response.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AuthorService {

    AuthorResponse create(AuthorRequest request);

    AuthorResponse update(Long id, AuthorRequest request);

    void delete(Long id);

    void restore(Long id);

    PageResponse<AuthorResponse> getAll(Boolean deleted , Pageable pageable);

    AuthorResponse getById(Long id);

}
