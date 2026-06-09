package com.project.BookStore.Author.Repository;

import com.project.BookStore.Address.Entity.Address;
import com.project.BookStore.Author.Entity.Author;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AuthorRepository extends JpaRepository<Author, Long> {

    Page<Author> findByDeletedAtIsNull(Pageable pageable);

    Page<Author> findByDeletedAtIsNotNull(Pageable pageable);

    Optional<Author> findByIdAndDeletedAtIsNull(Long id);

    Page<Author> findAll(Pageable pageable);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
