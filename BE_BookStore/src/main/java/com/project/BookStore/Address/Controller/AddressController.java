package com.project.BookStore.Address.Controller;


import com.project.BookStore.Address.DTO.Request.AddressRequest;
import com.project.BookStore.Address.DTO.Response.AddressResponse;
import com.project.BookStore.Address.Service.AddressService;
import com.project.BookStore.Common.Response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping("/my")
    public ApiResponse<List<AddressResponse>> getMyAddresses() {
        return ApiResponse.success(
                addressService.getMyAddresses(),
                "Get my addresses successfully"
        );
    }

    @GetMapping("/my/{id}")
    public ApiResponse<AddressResponse> getMyAddressById(@PathVariable Long id) {
        return ApiResponse.success(
                addressService.getMyAddressById(id),
                "Get my address successfully"
        );
    }

    @PostMapping
    public ApiResponse<AddressResponse> create(@RequestBody @Valid AddressRequest request) {
        return ApiResponse.success(
                addressService.createMyAddress(request),
                "Create address successfully"
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<AddressResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid AddressRequest request
    ) {
        return ApiResponse.success(
                addressService.updateMyAddress(id, request),
                "Update address successfully"
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        addressService.deleteMyAddress(id);
        return ApiResponse.success("Delete address successfully");
    }

    @PutMapping("/{id}/default")
    public ApiResponse<Void> setDefault(@PathVariable Long id) {
        addressService.setDefaultAddress(id);
        return ApiResponse.success("Set default address successfully");
    }

    @GetMapping("/default")
    public ApiResponse<AddressResponse> getDefault() {
        return ApiResponse.success(
                addressService.getDefaultAddress(),
                "Get default address successfully"
        );
    }
}