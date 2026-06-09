package com.project.BookStore.Book.Repository;


import com.project.BookStore.Book.Entity.BookAuthor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface BookAuthorRepository extends JpaRepository<BookAuthor, BookAuthor.BookAuthorId>, BookRepositoryCustom {
    Boolean existsByBookIdAndAuthorId(Long bookId, Long authorId);
   Optional<BookAuthor> findByBookIdAndAuthorId(Long bookId, Long authorId);
}
