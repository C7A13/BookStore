package com.project.BookStore.User.DTO.Response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateResponse {

    private Long id;

    private String userName;

    private String fullName;

    private String email;

    private String phone;

    private LocalDate dob;

    private String avatarUrl;

    String lastLoginAt;

    @JsonProperty("isEmailVerified")
    boolean isEmailVerified ;

    @JsonProperty("isPhoneVerified")
    boolean isPhoneVerified ;

    Set<String> roles;

    private Boolean isDeleted;
}
