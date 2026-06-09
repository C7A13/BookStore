package com.project.BookStore.Common.Validation.UserName;


import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Documented
@Target({ElementType.FIELD})
@Constraint(validatedBy = UserNameValidator.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface UserNameConstraint {
    String message() default "User Name Invalid";

    int min() default 4;

    int max() default 30;

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
