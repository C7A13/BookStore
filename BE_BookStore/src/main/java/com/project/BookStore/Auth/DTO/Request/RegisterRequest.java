package com.project.BookStore.Auth.DTO.Request;


import com.project.BookStore.Common.Validation.Password.PasswordContraint.PasswordConstraint;
import com.project.BookStore.Common.Validation.Password.PasswordMatches.PasswordConfirmable;
import com.project.BookStore.Common.Validation.Password.PasswordMatches.PasswordMatches;
import com.project.BookStore.Common.Validation.UserName.UserNameConstraint;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;


@Getter
@Setter
public class RegisterRequest  {
    @UserNameConstraint(min = 4 , max = 30 , message = "USERNAME_INVALID")
    private String userName;

    private String fullName;

    @Email
    private String email;

    private String phone;

    private LocalDate dob;

    @PasswordConstraint(min = 8, message = "PASSWORD_INVALID")
    private String password;


}
