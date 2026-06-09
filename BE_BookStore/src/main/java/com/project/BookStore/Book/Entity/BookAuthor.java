package com.project.BookStore.Book.Entity;

import com.project.BookStore.Author.Entity.Author;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "book_authors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookAuthor {

    @EmbeddedId
    private BookAuthorId id = new BookAuthorId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("bookId")
    @JoinColumn(name = "book_id")
    private Book book;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("authorId")
    @JoinColumn(name = "author_id")
    private Author author;

    @Column(length = 30, nullable = false)
    private String role = "author";  // author | translator | editor

    // Composite key
    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class BookAuthorId implements java.io.Serializable {
        @Column(name = "book_id")
        private Long bookId;

        @Column(name = "author_id")
        private Long authorId;
    }
}
