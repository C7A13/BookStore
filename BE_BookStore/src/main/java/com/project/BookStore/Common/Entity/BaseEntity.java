package com.project.BookStore.Common.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@MappedSuperclass
//@EntityListeners(AuditEntityListener.class)
public class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

//    @Column(name = "created_by")
//    private  Long createdBy;
//
//    @Column(name = "update_by")
//    private  Long updatedBy;
//
//    @Column(name = "deleted_by")
//    private  Long deletedBy;

}
