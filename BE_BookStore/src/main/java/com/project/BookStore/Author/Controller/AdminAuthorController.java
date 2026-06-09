package com.project.BookStore.Author.Controller;

import com.project.BookStore.Author.DTO.Request.AuthorRequest;
import com.project.BookStore.Author.DTO.Response.AuthorResponse;
import com.project.BookStore.Author.Service.AuthorServiceImpl;
import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Common.Response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/authors")
@RequiredArgsConstructor
public class AdminAuthorController {
    final AuthorServiceImpl authorService;
    @PostMapping
    public ApiResponse<AuthorResponse> create(@Valid @RequestBody AuthorRequest request) {
        return ApiResponse.success(
                authorService.create(request),
                "Create author successfully"
        );
    }


    @PutMapping("/{id}")
    public ApiResponse<AuthorResponse> update(@PathVariable Long id,
                                                 @Valid @RequestBody AuthorRequest  request) {
        return ApiResponse.success(
                authorService.update(id, request),
                "Update publisher successfully"
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        authorService.delete(id);
        return ApiResponse.success("Delete publisher successfully");
    }


    @PutMapping("/{id}/restore")
    public ApiResponse<Void> restore(@PathVariable Long id) {
        authorService.restore(id);
        return ApiResponse.success("Restore publisher successfully");
    }


    @GetMapping
    public ApiResponse<PageResponse<AuthorResponse>> getAll(
            @RequestParam(required = false) Boolean deleted , Pageable pageable) {
        return ApiResponse.success(
                authorService.getAll(deleted , pageable),
                "Get all publishers successfully"
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<AuthorResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(
                authorService.getById(id),
                "Get publisher successfully"
        );
    }
}
