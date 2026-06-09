package com.project.BookStore.User.Repository;

import com.project.BookStore.User.Entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Boolean existsUserByUserName(String userName);

    Boolean existsUserByPhone(String phone);

    Boolean existsUserByEmail(String email);

    Boolean existsUserByUserNameAndIdNot(String userName , Long id);

    Boolean existsUserByEmailAndIdNot(String email , Long id);

    Boolean existsUserByPhoneAndIdNot(String phone , Long id);

    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    Optional<User> findByPhone(String phone);

    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    Optional<User> findByUserName(String userName);

    @EntityGraph(attributePaths = {"roles", "roles.permissions"})
    @Query("select u from User u where u.id = :id")
    Optional<User> findByIdWithRolesAndPermissions(@Param("id") Long id);

    Boolean existsByEmail(String email);

    @EntityGraph(attributePaths = {"roles"})
    Page<User> findAll(Pageable pageable);
}
