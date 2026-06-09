package com.project.BookStore.Auth.Mapper;


import com.project.BookStore.Auth.DTO.Request.RegisterRequest;
import com.project.BookStore.Auth.DTO.Response.RegisterResponse;
import com.project.BookStore.User.Entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RegisterMapper {
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "status",  constant = "ACTIVE")
    User toUser(RegisterRequest request);

}
