package com.project.BookStore.Publisher.DTO.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PublisherRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @Email(message = "Email is invalid")
    private String email;

    private String phone;

    private String address;
}
