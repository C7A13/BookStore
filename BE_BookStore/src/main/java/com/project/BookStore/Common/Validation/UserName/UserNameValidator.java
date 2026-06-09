package com.project.BookStore.Common.Validation.UserName;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class UserNameValidator implements ConstraintValidator<UserNameConstraint, String> {
    private int min;
    private int max;

    @Override
    public void initialize(UserNameConstraint constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
        this.max = constraintAnnotation.max();
        this.min = constraintAnnotation.min();

    }

    @Override
    public boolean isValid(String s, ConstraintValidatorContext constraintValidatorContext) {
        if(s == null || s.isBlank()) return false;

        boolean regexOk = s.matches("^[A-Za-z][A-Za-z0-9_]*$");
        boolean lengthOk = s.length() >= min && s.length() <= max;
        boolean notAllDigits = !s.matches("^\\d+$");

        return regexOk && lengthOk && notAllDigits;
    }
}
