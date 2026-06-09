package com.project.BookStore.Catetory.Controller;

import com.project.BookStore.Catetory.DTO.Response.CategoryResponse;
import com.project.BookStore.Catetory.DTO.Response.CategoryTreeResponse;
import com.project.BookStore.Catetory.Service.CategoryService;
import com.project.BookStore.Common.Response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/public/tree")
    public ApiResponse<List<CategoryTreeResponse>> getTree() {
        return ApiResponse.success(
                categoryService.getTree(),
                "Get category tree successfully");
    }

    @GetMapping("/{slug}")
    public ApiResponse<CategoryResponse> getBySlug(@PathVariable String slug) {
        return ApiResponse.success(
                categoryService.getBySlug(slug),
                "Get category successfully"
        );
    }
}
