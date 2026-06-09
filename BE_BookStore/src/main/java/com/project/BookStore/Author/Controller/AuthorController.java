package com.project.BookStore.Author.Controller;

import com.project.BookStore.Author.DTO.Response.AuthorResponse;
import com.project.BookStore.Author.Service.AuthorServiceImpl;
import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Common.Response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/authors")
@RequiredArgsConstructor
public class AuthorController {

    private final AuthorServiceImpl authorService;

    @GetMapping
    public ApiResponse<PageResponse<AuthorResponse>> getAll(Pageable pageable) {
        return ApiResponse.success(
                authorService.getAll(false, pageable),
                "Get active authors successfully"
        );
    }
}
