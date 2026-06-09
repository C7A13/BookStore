package com.project.BookStore.Auth.Controller;

import com.project.BookStore.Auth.DTO.Request.*;
import com.project.BookStore.Auth.DTO.Response.AuthResponse;
import com.project.BookStore.Auth.Service.EmailVerificationService;
import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Auth.Service.AuthServiceImpl;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequiredArgsConstructor
@RequestMapping("/auth")
public class AuthenticationController {
    final AuthServiceImpl authService;
    final EmailVerificationService emailVerificationService;
    
    @PostMapping("/register")
    public ApiResponse<Void> register(@RequestBody @Valid RegisterRequest request) {
        authService.register(request);
        return ApiResponse.success("Registration successful! A verification email has been sent to " +
                "+ request.getEmail() + . Please activate your account to be able to log in.");
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@RequestBody LocalLoginRequest request, HttpServletResponse response) {
        return ApiResponse.success(
                authService.login(request, response),
                "Login successfully"
        );
    }

    @PostMapping("/login/social")
    public ApiResponse<AuthResponse> login(@RequestBody SocialLoginRequest request, HttpServletResponse response) {
        return ApiResponse.success(
                authService.loginSocial(request, response),
                "Login successfully"
        );
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(
            @CookieValue("refresh_token") String refreshToken
    ) {
        return ApiResponse.success(
                authService.refresh(refreshToken),
                "Refresh token successfully"
        );
    }

    @PostMapping("/log-out")
    public ApiResponse<Void> logout(
            @RequestHeader("Authorization") String authorization,
            @CookieValue("refresh_token") String refreshToken,
            HttpServletResponse response
    ) {
        authService.logout(authorization, refreshToken, response);
        return ApiResponse.success("Logout successfully");
    }
    @GetMapping("/verify")
    public ResponseEntity<Void> verifyAccount(@RequestParam("token") String token) {
        emailVerificationService.verifyTokenAndActivateUser(token);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create("http://localhost:5173/verify-success"))
                .build();
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        emailVerificationService.sendForgotPasswordEmail(request.getEmail());
        return ApiResponse.success("Hệ thống đã gửi liên kết đặt lại mật khẩu vào Gmail của bạn.");
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@RequestBody ResetPasswordRequest request
                                           ) {
        emailVerificationService.resetPassword(request.getToken(), request.getNewPassword());
        return ApiResponse.success("Mật khẩu của bạn đã được thay đổi thành công! Hãy đăng nhập lại.");
    }


}
