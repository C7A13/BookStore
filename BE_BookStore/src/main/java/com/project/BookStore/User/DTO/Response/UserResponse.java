package com.project.BookStore.User.DTO.Response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;

    private String userName;

    private String fullName;

    private String email;

    private String phone;

    private LocalDate dob;

    private String avatarUrl;

    LocalDateTime lastLoginAt;

    @JsonProperty("isEmailVerified")
    boolean isEmailVerified ;

    @JsonProperty("isPhoneVerified")
    boolean isPhoneVerified ;

    String status;

    Set<String> roles;

    private Boolean isDeleted;

//    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
//    LocalDateTime createdAt;
//
//    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
//    LocalDateTime updatedAt;
//
//    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
//    LocalDateTime deletedAt;

}
