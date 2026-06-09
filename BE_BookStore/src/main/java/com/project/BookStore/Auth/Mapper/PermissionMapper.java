package com.project.BookStore.Auth.Mapper;

import com.project.BookStore.Auth.DTO.Request.PermissionRequest;
import com.project.BookStore.Auth.DTO.Response.PermissionResponse;
import com.project.BookStore.Auth.Entity.Permission;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    Permission toPermission (PermissionRequest permissionRequest);

    PermissionResponse toPermissionResponse (Permission permission);

    List<PermissionResponse> toPermissionResponseList (List<Permission> permissionList);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updatePermission(@MappingTarget Permission permission, PermissionRequest request);
}
