package com.project.BookStore.Common.Validation.Password.PasswordContraint;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Target({ElementType.FIELD})
@Constraint(validatedBy = PasswordConstraintValidator.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface PasswordConstraint {
    String message() default "Password is failed";

    int min() default 4;

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
