package com.project.BookStore.Catetory.Mapper;



import com.project.BookStore.Catetory.DTO.Request.CategoryRequest;
import com.project.BookStore.Catetory.DTO.Response.CategoryResponse;
import com.project.BookStore.Catetory.DTO.Response.CategoryTreeResponse;
import com.project.BookStore.Catetory.Entity.Category;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    // ================= ENTITY -> RESPONSE =================
    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "isDeleted", expression = "java(category.getDeletedAt() != null)")
    CategoryResponse toResponse(Category category);

    List<CategoryResponse> toResponseList(List<Category> categories);

    // ================= ENTITY -> TREE =================
    @Mapping(target = "children", ignore = true)
    CategoryTreeResponse toTreeResponse(Category category);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "parent", ignore = true)
    void updateCategory(@MappingTarget Category category, CategoryRequest request);

}