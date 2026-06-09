package com.project.BookStore.Auth.Mapper;



import com.project.BookStore.Auth.DTO.Request.RoleRequest;
import com.project.BookStore.Auth.DTO.Response.RoleResponse;
import com.project.BookStore.Auth.Entity.Role;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "permissions" , ignore = true)
    Role toRole (RoleRequest request);

    @Mapping(target = "permissions" , ignore = true)
    RoleResponse toRoleResponse(Role role);

    List<RoleResponse> toPermissionResponseList (List<Role> roleList);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "permissions" , ignore = true)
    void updateRole(@MappingTarget Role role, RoleRequest request);
}
