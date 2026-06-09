package com.project.BookStore.User.Mapper;

import com.project.BookStore.User.DTO.Request.ProfileUpdateRequest;
import com.project.BookStore.User.DTO.Request.UserCreationRequest;
import com.project.BookStore.User.DTO.Request.UserUpdateRequest;
import com.project.BookStore.User.DTO.Response.ProfileUpdateResponse;
import com.project.BookStore.User.DTO.Response.UserResponse;
import com.project.BookStore.User.DTO.Response.UserUpdateResponse;
import com.project.BookStore.Auth.Entity.Role;
import com.project.BookStore.User.Entity.User;
import org.mapstruct.*;

import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "roles", expression = "java(mapRoles(user.getRoles()))")
    @Mapping(target = "isDeleted", source = "deleted")
    UserResponse toResponse(User user);

    @Mapping(target = "roles", expression = "java(mapRoles(user.getRoles()))")
    @Mapping(target = "isDeleted", source = "deleted")
    UserUpdateResponse toUpdateResponse(User user);

    default Set<String> mapRoles(Set<Role> role) {
        return role.stream()
                .map(Role::getName)
                .collect(Collectors.toSet());
    }

    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "status",  constant = "ACTIVE")
    User toEntity(UserCreationRequest request);



    @Mapping(target = "roles", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);

    @Mapping(target = "userName", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateProfile(@MappingTarget User user , ProfileUpdateRequest request);

    ProfileUpdateResponse toUpdateProfile(User user);
}
