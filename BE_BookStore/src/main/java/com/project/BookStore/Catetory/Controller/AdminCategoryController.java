package com.project.BookStore.Catetory.Controller;

import com.project.BookStore.Catetory.DTO.Request.CategoryRequest;
import com.project.BookStore.Catetory.DTO.Response.CategoryResponse;
import com.project.BookStore.Catetory.Service.CategoryService;
import com.project.BookStore.Common.Response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ApiResponse<CategoryResponse> create(@RequestBody CategoryRequest request) {
        return ApiResponse.success(
                categoryService.create(request),
                "Create category successfully"
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<CategoryResponse> update(@PathVariable Long id,
                                                @RequestBody CategoryRequest request) {
        return ApiResponse.success(
                categoryService.update(id, request),
                "Update category successfully"
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ApiResponse.success("Delete category successfully");
    }

    @PutMapping("/{id}/restore")
    public ApiResponse<Void> restore(@PathVariable Long id) {
        categoryService.restore(id);
        return ApiResponse.success("Restore category successfully");
    }

    @PutMapping("/{id}/toggle-active")
    public ApiResponse<Void> toggleActive(@PathVariable Long id) {
        categoryService.toggleActive(id);
        return ApiResponse.success("Toggle category status successfully");
    }

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getAll( @RequestParam(required = false) Boolean deleted) {

        return ApiResponse.success(categoryService.getAll(deleted),
                "Get all categories successfully"
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<CategoryResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(
                categoryService.getById(id),
                "Get category successfully"
        );
    }
}

