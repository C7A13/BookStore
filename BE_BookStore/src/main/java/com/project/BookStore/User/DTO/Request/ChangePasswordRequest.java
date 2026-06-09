package com.project.BookStore.User.DTO.Request;

import com.project.BookStore.Common.Validation.Password.PasswordContraint.PasswordConstraint;
import com.project.BookStore.Common.Validation.Password.PasswordMatches.PasswordConfirmable;
import com.project.BookStore.Common.Validation.Password.PasswordMatches.PasswordMatches;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@PasswordMatches(message = "PASSWORD_NOT_MATCHES")
public class ChangePasswordRequest implements PasswordConfirmable {
    String oldPassword;

    @PasswordConstraint(min = 8, message = "PASSWORD_INVALID")
    String newPassword;

    String confirmPassword;

    @Override
    public String getPassword() {
        return newPassword;
    }
}
