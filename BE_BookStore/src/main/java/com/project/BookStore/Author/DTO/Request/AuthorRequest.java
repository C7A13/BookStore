package com.project.BookStore.Author.DTO.Request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthorRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 150, message = "Full name must not exceed 150 characters")
    private String fullName;

    private String bio;

    @Size(max = 60, message = "Nationality must not exceed 60 characters")
    private String nationality;

    @Min(value = 1000, message = "Birth year must be a valid year")
    @Max(value = 9999, message = "Birth year must be a valid year")
    private Short birthYear;
}
