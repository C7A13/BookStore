package com.project.BookStore.Address.Service;


import com.project.BookStore.Address.DTO.Request.AddressRequest;
import com.project.BookStore.Address.DTO.Response.AddressResponse;
import com.project.BookStore.Common.Response.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AddressService {

    List<AddressResponse> getMyAddresses();

    AddressResponse getMyAddressById(Long id);

    AddressResponse createMyAddress(AddressRequest request);

    AddressResponse updateMyAddress(Long id, AddressRequest request);

    void deleteMyAddress(Long id);

    void setDefaultAddress(Long id);

    AddressResponse getDefaultAddress();

    PageResponse<AddressResponse> getAllAddresses(Pageable pageable);

    List<AddressResponse> getAddressesByUserId(Long userId);

    AddressResponse getAddressById(Long id);

    void adminDeleteAddress(Long id);
}