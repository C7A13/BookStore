package com.project.BookStore.Book.Repository;

import com.project.BookStore.Book.Entity.BookImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookImageRepository extends JpaRepository<BookImage, Long>, BookRepositoryCustom {

}
