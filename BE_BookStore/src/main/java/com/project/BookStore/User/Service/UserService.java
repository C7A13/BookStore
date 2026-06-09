package com.project.BookStore.User.Service;

import com.project.BookStore.User.DTO.Request.*;
import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.User.DTO.Response.ProfileUpdateResponse;
import com.project.BookStore.User.DTO.Response.UserResponse;
import com.project.BookStore.User.DTO.Response.UserUpdateResponse;
import org.springframework.data.domain.Pageable;

public interface UserService {
    UserResponse createUser(UserCreationRequest request);

    UserResponse myInfo();

    PageResponse<UserResponse> getUsers(Pageable pageable);

    UserUpdateResponse updateUser(Long id, UserUpdateRequest request);

    void softDeleteUser(Long UserId);

    ProfileUpdateResponse updateMyProfile(ProfileUpdateRequest request);

    UserResponse updateMyAvatar(AvatarUpdateRequest request);

    java.util.Map<String, Object> getAvatarUploadSignature();

    void restoreUser(Long userId);

    void changePassword(ChangePasswordRequest request);

    void changeUserStatus(Long userId, ChangeUserStatusRequest status);
}
