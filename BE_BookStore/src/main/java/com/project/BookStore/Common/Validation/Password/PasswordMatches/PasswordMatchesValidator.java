package com.project.BookStore.Common.Validation.Password.PasswordMatches;

import com.project.BookStore.Auth.DTO.Request.RegisterRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordMatchesValidator implements ConstraintValidator<PasswordMatches, PasswordConfirmable> {

    @Override
    public boolean isValid(PasswordConfirmable value, ConstraintValidatorContext context) {

        if (value == null) return false;

        String password = value.getPassword();
        String confirm = value.getConfirmPassword();

        if (password == null || confirm == null) return false;

        return password.equals(confirm);
    }
}
