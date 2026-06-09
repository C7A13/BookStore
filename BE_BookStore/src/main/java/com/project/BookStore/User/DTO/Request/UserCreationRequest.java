package com.project.BookStore.User.DTO.Request;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.project.BookStore.Common.Validation.BirthDay.BirthDayConstraint;
import com.project.BookStore.Common.Validation.Password.PasswordContraint.PasswordConstraint;
import com.project.BookStore.Common.Validation.UserName.UserNameConstraint;
import jakarta.validation.constraints.Email;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserCreationRequest {

    @UserNameConstraint(min = 4 , max = 30 , message = "USERNAME_INVALID")
    private String userName;

    private String fullName;

    @Email
    private String email;

    @PasswordConstraint(min = 8, message = "PASSWORD_INVALID")
    private String password;

    private String phone;

    @BirthDayConstraint(message = "BIRTHDAY_INVALID")
    private LocalDate dob;

    private String avatarUrl;

    List<Long> roles;
}
