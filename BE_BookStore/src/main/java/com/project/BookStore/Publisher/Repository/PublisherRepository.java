package com.project.BookStore.Publisher.Repository;

import com.project.BookStore.Publisher.Entity.Publisher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PublisherRepository extends JpaRepository<Publisher, Long> {

    List<Publisher> findByDeletedAtIsNull();

    List<Publisher> findByDeletedAtIsNotNull();

    List<Publisher> findByDeletedAtIsNullAndIsActiveTrue();

    Optional<Publisher> findByIdAndDeletedAtIsNull(Long id);

    boolean existsByName(String name);
}
