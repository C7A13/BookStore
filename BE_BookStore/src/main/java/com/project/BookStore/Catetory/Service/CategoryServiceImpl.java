package com.project.BookStore.Catetory.Service;

import com.project.BookStore.Catetory.DTO.Request.CategoryRequest;
import com.project.BookStore.Catetory.DTO.Response.CategoryResponse;
import com.project.BookStore.Catetory.DTO.Response.CategoryTreeResponse;
import com.project.BookStore.Catetory.Entity.Category;
import com.project.BookStore.Catetory.Mapper.CategoryMapper;
import com.project.BookStore.Catetory.Repository.CategoryRepository;
import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Common.Exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    // ================= CREATE =================
    @Override
    public CategoryResponse create(CategoryRequest request) {

        Category parent = null;
        String path ;

        if (request.getParentId() != null) {
            parent = categoryRepository.findByIdAndDeletedAtIsNull(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.PARENT_NOT_FOUNT));
        }

        Category category = Category.builder()
                .name(request.getName())
                .slug(generateSlug(request.getName()))
                .parent(parent)
                .isActive(true)
                .build();

        categoryRepository.save(category);

        if (parent == null) {
            path = "/" + category.getId();
        } else {
            path = parent.getPath() + "/" + category.getId();
        }
        category.setPath(path);
        categoryRepository.save(category);
        return categoryMapper.toResponse(category);
    }

    // ================= UPDATE =================
    @Override
    public CategoryResponse update(Long id, CategoryRequest request) {

        Category category = categoryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUNT));

        Category parent = null;

        if (request.getParentId() != null) {
            parent = categoryRepository.findByIdAndDeletedAtIsNull(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.PARENT_NOT_FOUNT));

            if (parent.getId().equals(id)) {
                throw new AppException(ErrorCode.CANNOT_SET_ITSELF_PARENT);
            }

            if (isCyclic(parent, category)) {
                throw new AppException(ErrorCode.CYCLIC_CATEGORY);
            }
        }

        categoryMapper.updateCategory(category,request);
        category.setSlug(generateSlug(request.getName()));
        category.setParent(parent);

        categoryRepository.save(category);

        return categoryMapper.toResponse(category);
    }

    @Override
    public void delete(Long id) {

        Category category = categoryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUNT));

        category.setDeletedAt(LocalDateTime.now());

        categoryRepository.save(category);
    }

    // ================= RESTORE =================
    @Override
    public void restore(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUNT));

        category.setDeletedAt(null);

        categoryRepository.save(category);
    }

    @Override
    public void toggleActive(Long id) {

        Category category = categoryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUNT));

        category.setIsActive(!category.getIsActive());

        categoryRepository.save(category);
    }




    @Override
    public List<CategoryResponse> getAll(Boolean deleted) {
        if (deleted == null) {
            return categoryMapper.toResponseList(categoryRepository.findAll());
        }
        if (deleted) {
            return categoryMapper.toResponseList(categoryRepository.findByDeletedAtIsNotNull());
        }
        return categoryMapper.toResponseList(categoryRepository.findByDeletedAtIsNull());
    }


    @Override
    public CategoryResponse getById(Long id) {

        Category category = categoryRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUNT));

        return categoryMapper.toResponse(category);
    }

    @Override
    public CategoryResponse getBySlug(String slug) {
        Optional<Category> categoryOptional = categoryRepository.findBySlug(slug);
        Category category = categoryOptional.orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUNT));

        return categoryMapper.toResponse(category);
    }


    @Override
    public List<CategoryTreeResponse> getTree() {

        List<Category> categories = categoryRepository.findByDeletedAtIsNullAndIsActiveTrue();

        Map<Long, CategoryTreeResponse> map = new HashMap<>();

        for (Category c : categories) {
            CategoryTreeResponse node = categoryMapper.toTreeResponse(c);
            node.setChildren(new ArrayList<>());
            map.put(c.getId(), node);
        }

        List<CategoryTreeResponse> roots = new ArrayList<>();

        for (Category c : categories) {

            if (c.getParent() == null) {
                roots.add(map.get(c.getId()));
            } else {
                CategoryTreeResponse parentNode = map.get(c.getParent().getId());

                if (parentNode != null) {
                    parentNode.getChildren().add(map.get(c.getId()));
                }
            }
        }

        for (CategoryTreeResponse root : roots) {
            setLevel(root, 0);
        }

        return roots;
    }



    private String generateSlug(String name) {

        String normalized = Normalizer.normalize(name, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        String base = normalized.toLowerCase()
                .replaceAll("đ", "d") //
                .replaceAll("[^a-z0-9\\s]", "")
                .trim()
                .replaceAll("\\s+", "-");

        String slug = base;
        int count = 1;

        while (categoryRepository.existsBySlug(slug)) {
            slug = base + "-" + count++;
        }

        return slug;
    }

    private boolean isCyclic(Category parent, Category child) {

        Category temp = parent;

        while (temp != null) {
            if (temp.getId().equals(child.getId())) {
                return true;
            }
            temp = temp.getParent();
        }

        return false;
    }

    private void setLevel(CategoryTreeResponse node, int level) {

        node.setLevel(level);

        for (CategoryTreeResponse child : node.getChildren()) {
            setLevel(child, level + 1);
        }
    }

}