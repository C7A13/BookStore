package com.project.BookStore.Common.Validation.BirthDay;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.time.LocalDate;
import java.time.Period;

public class BirthDayValidator implements ConstraintValidator<BirthDayConstraint, LocalDate> {
    @Override
    public void initialize(BirthDayConstraint constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(LocalDate birthDay, ConstraintValidatorContext constraintValidatorContext) {
        if(birthDay == null ) return false;
        LocalDate today = LocalDate.now();
        if(birthDay.isAfter(today)) return false;
        int age = Period.between(birthDay, today).getYears();
        return age >= 15;
    }
}
