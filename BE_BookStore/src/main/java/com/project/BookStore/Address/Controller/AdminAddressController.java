package com.project.BookStore.Address.Controller;

import com.project.BookStore.Address.DTO.Request.AddressRequest;
import com.project.BookStore.Address.DTO.Response.AddressResponse;
import com.project.BookStore.Address.Service.AddressService;
import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Common.Response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/admin/addresses")
@RequiredArgsConstructor
public class AdminAddressController {

    private final AddressService addressService;

    @GetMapping
    public ApiResponse<PageResponse<AddressResponse>> getAll(Pageable pageable) {
        return ApiResponse.success(
                addressService.getAllAddresses(pageable),
                "Get all addresses successfully"
        );
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<AddressResponse>> getByUserId(@PathVariable Long userId) {
        return ApiResponse.success(
                addressService.getAddressesByUserId(userId),
                "Get addresses by user successfully"
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<AddressResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(
                addressService.getAddressById(id),
                "Get address successfully"
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        addressService.adminDeleteAddress(id);
        return ApiResponse.success("Delete address successfully");
    }
}
