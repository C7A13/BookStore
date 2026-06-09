package com.project.BookStore.User.DTO.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateResponse {

    private String userName;

    private String fullName;

    private String email;

    private String phone;

    private LocalDate dob;

    private String avatarUrl;

}
