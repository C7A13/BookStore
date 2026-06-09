package com.project.BookStore.Auth.Service.Role;

import com.project.BookStore.Auth.DTO.Request.RoleRequest;
import com.project.BookStore.Auth.DTO.Response.RoleResponse;

import java.util.List;

public interface RoleService {
    RoleResponse createRole(RoleRequest request);

    List<RoleResponse> getRoles();

    RoleResponse updateRole(Long roleId , RoleRequest request);

    void deleteRole(Long roleID);
}
