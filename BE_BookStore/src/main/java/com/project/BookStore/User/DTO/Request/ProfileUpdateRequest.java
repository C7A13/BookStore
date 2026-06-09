package com.project.BookStore.User.DTO.Request;

import com.project.BookStore.Common.Validation.BirthDay.BirthDayConstraint;
import com.project.BookStore.Common.Validation.UserName.UserNameConstraint;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {

    private String userName;

    private String fullName;

    @Email
    private String email;

    private String phone;

    private LocalDate dob;

}
