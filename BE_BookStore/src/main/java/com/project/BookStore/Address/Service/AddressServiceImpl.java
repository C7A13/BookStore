package com.project.BookStore.Address.Service;

import com.project.BookStore.Address.DTO.Request.AddressRequest;
import com.project.BookStore.Address.DTO.Response.AddressResponse;
import com.project.BookStore.Address.Entity.Address;
import com.project.BookStore.Address.Mapper.AddressMapper;
import com.project.BookStore.Address.Repository.AddressRepository;
import com.project.BookStore.Auth.Security.UserContextService;
import com.project.BookStore.Auth.Utils.SecurityUtil;
import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.User.Entity.User;
import com.project.BookStore.User.Repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddressServiceImpl implements AddressService{
    final UserContextService userContextService;
    final SecurityUtil securityUtil;
    final AddressRepository addressRepository;
    final AddressMapper addressMapper;
    final UserRepository userRepository;

    @Override
    public List<AddressResponse> getMyAddresses() {
        Long userId = userContextService.getRequiredUserId();;
        return addressRepository.findByUserIdAndDeletedAtIsNull(userId)
                .stream()
                .map(addressMapper::toResponse)
                .toList();
    }

    @Override
    public AddressResponse getMyAddressById(Long id) {
        Long userId = userContextService.getRequiredUserId();;

        Address address = addressRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUNT));

        if (!address.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return addressMapper.toResponse(address);
    }

    @Override
    @Transactional
    public AddressResponse createMyAddress(AddressRequest request) {
        User user = securityUtil.getCurrentUser() ;
        Long userId = user.getId();

        Address address = addressMapper.toEntity(request);
        address.setUser(user);

        boolean hasDefault = addressRepository
                .findByUserIdAndIsDefaultTrueAndDeletedAtIsNull(userId)
                .isPresent();

        if (!hasDefault) {
            address.setIsDefault(true);
        }
        addressRepository.save(address);
        AddressResponse addressResponse = addressMapper.toResponse(address);
        return addressResponse;
    }

    @Override
    public AddressResponse updateMyAddress(Long id, AddressRequest request) {
        Long userId = userContextService.getRequiredUserId();;
        Address address = addressRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUNT));

        if (!address.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        addressMapper.updateAddress(address, request);

        return addressMapper.toResponse(addressRepository.save(address));
    }

    @Override
    public void deleteMyAddress(Long id) {
        Long userId = userContextService.getRequiredUserId();;
        Address address = addressRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUNT));

        if (!address.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        address.setDeletedAt(LocalDateTime.now());

        if (Boolean.TRUE.equals(address.getIsDefault())) {
            List<Address> list = addressRepository.findByUserIdAndDeletedAtIsNull(userId);

            for (Address a : list) {
                if (!a.getId().equals(id)) {
                    a.setIsDefault(true);
                    addressRepository.save(a);
                    break;
                }
            }
        }

        addressRepository.save(address);
    }

    @Override
    public void setDefaultAddress(Long id) {
        Long userId = userContextService.getRequiredUserId();;

        Address address = addressRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUNT));

        if (!address.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        List<Address> list = addressRepository.findByUserIdAndDeletedAtIsNull(userId);
        for (Address a : list) {
            a.setIsDefault(false);
        }

        address.setIsDefault(true);

        addressRepository.saveAll(list);
    }


    @Override
    public AddressResponse getDefaultAddress() {
        Long userId = userContextService.getRequiredUserId();;

        Address address = addressRepository
                .findByUserIdAndIsDefaultTrueAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new AppException(ErrorCode.NO_DEFAULT_ADDRESS));

        return addressMapper.toResponse(address);
    }

    // ADMIN

    @Override
    public PageResponse<AddressResponse> getAllAddresses(Pageable pageable) {
        int pageNumber = pageable.getPageNumber() - 1;
        pageNumber = Math.max(pageNumber, 0);
        org.springframework.data.domain.Pageable safePageable = org.springframework.data.domain.PageRequest.of(
                pageNumber,
                pageable.getPageSize(),
                pageable.getSort()
        );
        Page<AddressResponse> page = addressRepository.findAll(safePageable)
                .map(addressMapper::toResponse);
        return PageResponse.<AddressResponse>builder()
                .data(page.getContent())
                .page(page.getNumber() + 1)
                .size(page.getSize())
                .total(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    public List<AddressResponse> getAddressesByUserId(Long userId) {
        return addressRepository.findByUserIdAndDeletedAtIsNull(userId)
                .stream()
                .map(addressMapper::toResponse)
                .toList();
    }

    @Override
    public AddressResponse getAddressById(Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUNT));

        return addressMapper.toResponse(address);
    }

    @Override
    public void adminDeleteAddress(Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUNT));

        address.setDeletedAt(LocalDateTime.now());
        addressRepository.save(address);
    }
//    private Address checkCurrentAddressUser(Long id){
//
//        Address address = addressRepository.findByIdAndDeletedAtIsNull(id)
//                .orElseThrow(() -> new AppException(ErrorCode.ADDRESS_NOT_FOUNT));
//
//        if (!address.getUser().getId().equals(userId)) {
//            throw new AppException(ErrorCode.UNAUTHORIZED);
//        }
//        return  address;
//    }


}
