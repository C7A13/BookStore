package com.project.BookStore.Auth.Service.Permission;

import com.project.BookStore.Auth.DTO.Request.PermissionRequest;
import com.project.BookStore.Auth.DTO.Response.PermissionResponse;
import com.project.BookStore.Auth.Entity.Permission;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Auth.Mapper.PermissionMapper;
import com.project.BookStore.Auth.Repository.PermissionRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PermissionServiceImpl implements PermissionService {

    final PermissionRepository permissionRepository;
    final PermissionMapper permissionMapper;

    @Override
    public PermissionResponse createPermission(PermissionRequest request) {
        if(permissionRepository.existsPermissionByName(request.getName())){
            throw new AppException(ErrorCode.PERMISSION_EXISTED);
        }
        Permission permission = permissionMapper.toPermission(request);
        permissionRepository.save(permission);
        return permissionMapper.toPermissionResponse(permission);
    }

    @Override
    public List<PermissionResponse> getAllPermission() {
            List<Permission> permissionList = permissionRepository.findAll();
            return  permissionMapper.toPermissionResponseList(permissionList);
    }

    @Override
    public PermissionResponse updatePermission(Long permissionId, PermissionRequest request) {
        Optional<Permission> permissionOptional = permissionRepository.findById(permissionId);
        Permission permission = permissionOptional.orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));
        permissionMapper.updatePermission(permission,request);
        permissionRepository.save(permission);
        return permissionMapper.toPermissionResponse(permission);
    }

    @Override
    public void deletePermission(Long permissionId) {
        Optional<Permission> permissionOptional = permissionRepository.findById(permissionId);
        Permission permission = permissionOptional.orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));
        permissionRepository.deleteById(permissionId);
    }

    public List<Permission> validatePermissionIds (Set<Long> permissionIds){
        var permissions = permissionRepository.findAllById(permissionIds);
        Set<Long> foundIds = permissions
                .stream()
                .map(Permission::getId)
                .collect(Collectors.toSet());
        List<Long> missingIds = permissionIds.stream()
                .filter(id -> !foundIds.contains(id))
                .toList();

        if(!missingIds.isEmpty()){
            throw new AppException(ErrorCode.PERMISSION_NOT_FOUND);
        }
        return permissions;
    }
}
