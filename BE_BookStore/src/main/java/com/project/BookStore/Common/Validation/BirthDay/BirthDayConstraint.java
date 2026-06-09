package com.project.BookStore.Common.Validation.BirthDay;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD})
@Constraint(validatedBy = BirthDayValidator.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface BirthDayConstraint {
    String message() default "Invalid BirthDay";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
