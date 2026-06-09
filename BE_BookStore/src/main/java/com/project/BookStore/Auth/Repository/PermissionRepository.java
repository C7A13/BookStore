package com.project.BookStore.Auth.Repository;

import com.project.BookStore.Auth.Entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermissionRepository  extends JpaRepository<Permission , Long> {
    Boolean existsPermissionByName(String name);
}
