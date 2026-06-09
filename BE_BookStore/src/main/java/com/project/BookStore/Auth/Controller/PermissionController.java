package com.project.BookStore.Auth.Controller;

import com.project.BookStore.Auth.DTO.Request.PermissionRequest;
import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Auth.DTO.Response.PermissionResponse;
import com.project.BookStore.Auth.Service.Permission.PermissionServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionServiceImpl permissionService;
    @PostMapping
    public ApiResponse<PermissionResponse> create(@RequestBody @Valid PermissionRequest request) {
        return ApiResponse.success(
                permissionService.createPermission(request),
                "Create permission successfully"
        );
    }

    @GetMapping
    public ApiResponse<List<PermissionResponse>> getAll() {
        return ApiResponse.success(
                permissionService.getAllPermission(),
                "Get all permissions successfully"
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<PermissionResponse> update(
            @PathVariable("id") Long id,
            @RequestBody PermissionRequest request
    ) {
        return ApiResponse.success(
                permissionService.updatePermission(id, request),
                "Update permission successfully"
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") Long id) {
        permissionService.deletePermission(id);
        return ApiResponse.success("Delete permission successfully");
    }
}
