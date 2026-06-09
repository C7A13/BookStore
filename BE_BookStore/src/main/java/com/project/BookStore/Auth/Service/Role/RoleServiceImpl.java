package com.project.BookStore.Auth.Service.Role;

import com.project.BookStore.Auth.DTO.Request.RoleRequest;
import com.project.BookStore.Auth.DTO.Response.RoleResponse;
import com.project.BookStore.Auth.Entity.Permission;
import com.project.BookStore.Auth.Entity.Role;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Auth.Mapper.RoleMapper;
import com.project.BookStore.Auth.Repository.PermissionRepository;
import com.project.BookStore.Auth.Repository.RoleRepository;
import com.project.BookStore.Auth.Service.Permission.PermissionServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {
    final RoleRepository roleRepository;
    final RoleMapper roleMapper;
    final PermissionRepository permissionRepository;
    final PermissionServiceImpl permissionService;

    @Override
    public RoleResponse createRole(RoleRequest request) {
        if(roleRepository.existsRoleByName(request.getName())){
            throw new AppException(ErrorCode.ROLE_EXISTED);
        }
        var permissions = permissionService.validatePermissionIds(request.getPermissions());
        Role role = roleMapper.toRole(request);
        role.setPermissions(new HashSet<>(permissions));
        roleRepository.save(role);
        RoleResponse roleResponse = roleMapper.toRoleResponse(role);
        Set<String> permissionsResponse = permissions.stream().map(Permission::getName).collect(Collectors.toSet());
        roleResponse.setPermissions(permissionsResponse);
        return roleResponse;
    }

    @Override
    public List<RoleResponse> getRoles() {
        var roleList = roleRepository.findAll();
        return roleList.stream()
                .map(role -> {
                    RoleResponse roleResponse = roleMapper.toRoleResponse(role);

                    Set<String> permissionsResponse = role.getPermissions()
                            .stream()
                            .map(Permission::getName)
                            .collect(Collectors.toSet());
                    roleResponse.setPermissions(permissionsResponse);
                    return roleResponse;
                })
                .collect(Collectors.toList());
    }

    @Override
    public RoleResponse updateRole(Long roleId, RoleRequest request) {
        Optional<Role> roleOptional = roleRepository.findById(roleId);
        Role role = roleOptional.orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));
        roleMapper.updateRole(role , request);
        var permissions = permissionService.validatePermissionIds(request.getPermissions());
        role.setPermissions(new HashSet<>(permissions));
        roleRepository.save(role);
        RoleResponse roleResponse = roleMapper.toRoleResponse(role);
        Set<String> permissionsResponse = permissions.stream()
                .map(Permission::getName)
                .collect(Collectors.toSet());
        roleResponse.setPermissions(permissionsResponse);
        return  roleResponse;
    }

    @Override
    public void deleteRole(Long roleID) {
            roleRepository.deleteById(roleID);
    }

    public  List<Role> validateRoleIDs(List<Long> roleIDs){
        var roles = roleRepository.findAllById(roleIDs);

        Set<Long> foundIds = roles.stream()
                .map(Role::getId)
                .collect(Collectors.toSet());

        if(!foundIds.containsAll(roleIDs)){
            throw new AppException(ErrorCode.ROLE_NOT_FOUND);
        }
        return roles;
    }
}
