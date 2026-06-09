package com.project.BookStore.Auth.Service.Permission;

import com.project.BookStore.Auth.DTO.Request.PermissionRequest;
import com.project.BookStore.Auth.DTO.Response.PermissionResponse;

import java.util.List;

public interface PermissionService {
    PermissionResponse  createPermission(PermissionRequest request);

    List<PermissionResponse> getAllPermission();

    PermissionResponse updatePermission(Long PermissionId ,PermissionRequest request);

    void deletePermission(Long id);
}
