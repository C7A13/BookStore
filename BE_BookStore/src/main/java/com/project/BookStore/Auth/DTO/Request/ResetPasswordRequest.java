package com.project.BookStore.Auth.DTO.Request;

import lombok.Data;

@Data
public class ResetPasswordRequest {
    private String token;
    private String newPassword;
}