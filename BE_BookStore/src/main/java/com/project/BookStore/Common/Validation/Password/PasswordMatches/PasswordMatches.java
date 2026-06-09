package com.project.BookStore.Common.Validation.Password.PasswordMatches;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Target({ElementType.TYPE})
@Constraint(validatedBy = PasswordMatchesValidator.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface PasswordMatches {
    String message() default "PASSWORD_CONFIRM_NOT_MATCH";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
