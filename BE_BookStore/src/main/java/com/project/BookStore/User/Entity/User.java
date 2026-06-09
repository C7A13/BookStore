package com.project.BookStore.User.Entity;

import com.project.BookStore.Auth.Entity.Role;
import com.project.BookStore.Common.Entity.BaseEntity;
import com.project.BookStore.User.Enum.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users")
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class User extends BaseEntity {

    @Column(name = "email", nullable = false, length = 100 , unique = true )
    String email;

    @Column(name = "user_name", nullable = false, length = 100 , unique = true)
    String userName;

    @Column(name = "full_name")
    String fullName;

    @Column(name = "phone" , unique = true)
    String phone;

    @Column(name = "password_hash" )
    String password;

    @Column(name = "dob")
    LocalDate dob;

    @Column(name = "avatar_url")
    String avatarUrl;

    @Column(name = "last_login_at")
    LocalDateTime lastLoginAt;

    @Column(name = "is_email_verified")
    @Builder.Default
    boolean isEmailVerified = false ;

    @Column(name = "is_phone_verified")
    @Builder.Default
    boolean isPhoneVerified = false ;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    UserStatus status = UserStatus.ACTIVE;

    @Column(name = "is_deleted")
    @Builder.Default
    boolean isDeleted = false;

    @ManyToMany
    Set<Role> roles;
}
