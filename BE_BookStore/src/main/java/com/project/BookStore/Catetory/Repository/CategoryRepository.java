package com.project.BookStore.Catetory.Repository;

import com.project.BookStore.Catetory.Entity.Category;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    @EntityGraph(attributePaths = {"parent"})
    List<Category> findByDeletedAtIsNull();

    @EntityGraph(attributePaths = {"parent"})
    List<Category> findAll();

    @EntityGraph(attributePaths = {"parent"})
    List<Category> findByDeletedAtIsNotNull();

    @EntityGraph(attributePaths = {"parent"})
    List<Category> findByDeletedAtIsNullAndIsActiveTrue();

    @EntityGraph(attributePaths = {"parent"})
    Optional<Category> findByIdAndDeletedAtIsNull(Long id);

    boolean existsBySlug(String slug);

    Optional<Category> findBySlug(String slug);

    List<Category> findByPathStartingWith(String path);

}
