package com.project.BookStore.Auth.Repository;

import com.project.BookStore.Auth.Entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
     Boolean existsRoleByName(String name);
     Optional<Role> findByName(String name);

}
