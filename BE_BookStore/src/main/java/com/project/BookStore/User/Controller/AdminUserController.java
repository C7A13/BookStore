package com.project.BookStore.User.Controller;

import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.User.DTO.Request.*;
import com.project.BookStore.User.DTO.Response.UserResponse;
import com.project.BookStore.User.DTO.Response.UserUpdateResponse;
import com.project.BookStore.User.Service.UserServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/users")
public class AdminUserController {

    private final UserServiceImpl userService;

    @PostMapping
    public ApiResponse<UserResponse> create(@RequestBody @Valid UserCreationRequest request) {
        return ApiResponse.success(
                userService.createUser(request),
                "Create user successfully"
        );
    }

    @GetMapping
    public ApiResponse<PageResponse<UserResponse>> getAll(Pageable pageable) {
        return ApiResponse.success(
                userService.getUsers(pageable),
                "Get all users successfully"
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<UserUpdateResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid UserUpdateRequest request
    ) {
        return ApiResponse.success(
                userService.updateUser(id, request),
                "Update user successfully"
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        userService.softDeleteUser(id);
        return ApiResponse.success("Delete user successfully");
    }

    @PutMapping("/{id}/restore")
    public ApiResponse<Void> restore(@PathVariable Long id) {
        userService.restoreUser(id);
        return ApiResponse.success("Restore user successfully");
    }

    @PutMapping("/{id}/change-status")
    public ApiResponse<Void> changeStatus(
            @PathVariable Long id,
            @RequestBody @Valid ChangeUserStatusRequest request
    ) {
        userService.changeUserStatus(id, request);
        return ApiResponse.success("Change user status successfully");
    }

}
