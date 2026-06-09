package com.project.BookStore.Auth.Controller;

import com.project.BookStore.Auth.DTO.Request.RoleRequest;
import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Auth.DTO.Response.RoleResponse;
import com.project.BookStore.Auth.Service.Role.RoleServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
public class RoleController {
    final RoleServiceImpl roleService;

    @PostMapping
    public ApiResponse<RoleResponse> create(@RequestBody @Valid RoleRequest request) {
        return ApiResponse.success(
                roleService.createRole(request),
                "Create role successfully"
        );
    }

    @GetMapping
    public ApiResponse<List<RoleResponse>> getAll() {
        return ApiResponse.success(
                roleService.getRoles(),
                "Get all roles successfully"
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<RoleResponse> update(
            @PathVariable("id") Long id,
            @RequestBody RoleRequest request
    ) {
        return ApiResponse.success(
                roleService.updateRole(id, request),
                "Update role successfully"
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable("id") Long id) {
        roleService.deleteRole(id);
        return ApiResponse.success("Delete role successfully");
    }
}
