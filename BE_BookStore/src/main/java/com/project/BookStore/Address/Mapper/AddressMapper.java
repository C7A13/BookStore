package com.project.BookStore.Address.Mapper;

import com.project.BookStore.Address.DTO.Request.AddressRequest;
import com.project.BookStore.Address.DTO.Response.AddressResponse;
import com.project.BookStore.Address.Entity.Address;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AddressMapper {
    @Mapping(target = "isDefault", ignore = true)
    Address toEntity (AddressRequest request);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.fullName")
    @Mapping(target = "userEmail", source = "user.email")
    AddressResponse toResponse (Address address);

    void updateAddress(@MappingTarget Address address , AddressRequest request);
}
