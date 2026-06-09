package com.project.BookStore.Book.Repository;

import com.project.BookStore.Book.Entity.Book;
import com.project.BookStore.Book.DTO.Request.BookFilterRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BookRepositoryCustom {
    Page<Book> findAllWithFilter(BookFilterRequest filter, Pageable pageable);
}

