package com.project.BookStore.Auth.Service;

import com.project.BookStore.Auth.DTO.Request.LocalLoginRequest;
import com.project.BookStore.Auth.DTO.Request.RegisterRequest;
import com.project.BookStore.Auth.DTO.Request.SocialLoginRequest;
import com.project.BookStore.Auth.DTO.Response.AuthResponse;
import jakarta.servlet.http.HttpServletResponse;

public interface AuthService {
   void register(RegisterRequest request);

    AuthResponse login(LocalLoginRequest request, HttpServletResponse response);

    AuthResponse loginSocial(SocialLoginRequest request, HttpServletResponse response);

    AuthResponse refresh(String token);

    void logout(String authorization ,String refreshToken, HttpServletResponse response);
}
