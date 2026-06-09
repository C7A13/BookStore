package com.project.BookStore.User.Controller;

import com.project.BookStore.User.DTO.Request.*;
import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.User.DTO.Response.ProfileUpdateResponse;
import com.project.BookStore.User.DTO.Response.UserResponse;
import com.project.BookStore.User.DTO.Response.UserUpdateResponse;
import com.project.BookStore.User.Service.UserServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final UserServiceImpl userService;

    @GetMapping("/profile")
    public ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.success(
                userService.myInfo(),
                "Get my info successfully"
        );
    }


    @PutMapping("/profile/update")
    public ApiResponse<ProfileUpdateResponse> updateProfile(
            @RequestBody @Valid ProfileUpdateRequest request
    ) {
        return ApiResponse.success(
                userService.updateMyProfile(request),
                "Update profile successfully"
        );
    }

    @PutMapping("/profile/avatar")
    public ApiResponse<UserResponse> updateAvatar(
            @RequestBody @Valid AvatarUpdateRequest request
    ) {
        return ApiResponse.success(
                userService.updateMyAvatar(request),
                "Update avatar successfully"
        );
    }

    @GetMapping("/profile/avatar/signature")
    public ApiResponse<java.util.Map<String, Object>> getAvatarUploadSignature() {
        return ApiResponse.success(
                userService.getAvatarUploadSignature(),
                "Get upload signature successfully"
        );
    }

    @PutMapping("/profile/change-password")
    public ApiResponse<Void> changePassword(
            @RequestBody @Valid ChangePasswordRequest request
    ) {
        userService.changePassword(request);
        return ApiResponse.success("Change password successfully");
    }



}
