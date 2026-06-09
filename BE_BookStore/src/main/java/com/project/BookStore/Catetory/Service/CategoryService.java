package com.project.BookStore.Catetory.Service;

import com.project.BookStore.Catetory.DTO.Request.CategoryRequest;
import com.project.BookStore.Catetory.DTO.Response.CategoryResponse;
import com.project.BookStore.Catetory.DTO.Response.CategoryTreeResponse;
import com.project.BookStore.Catetory.Entity.Category;

import java.util.List;

public interface CategoryService {

    CategoryResponse create(CategoryRequest request);

    CategoryResponse update(Long id, CategoryRequest request);

    void delete(Long id);

    void restore(Long id);

    void toggleActive(Long id);

    List<CategoryResponse> getAll(Boolean deleted);

    CategoryResponse getById(Long id);

    CategoryResponse getBySlug(String slug);

    List<CategoryTreeResponse> getTree();
}