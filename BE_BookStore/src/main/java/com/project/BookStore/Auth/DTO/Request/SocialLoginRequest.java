package com.project.BookStore.Auth.DTO.Request;

import com.project.BookStore.Common.Enum.LoginType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SocialLoginRequest {
    @NotBlank(message = "Authorization Code không được để trống")
    private String code;
    private LoginType loginType;
}