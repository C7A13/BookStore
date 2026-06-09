package com.project.BookStore.Author.Entity;

import com.project.BookStore.Common.Entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Where;


@Entity
@Table(name = "authors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Author extends BaseEntity {

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(unique = true, length = 170)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 60)
    private String nationality;

    @Column(name = "birth_year")
    private Short birthYear;
}
