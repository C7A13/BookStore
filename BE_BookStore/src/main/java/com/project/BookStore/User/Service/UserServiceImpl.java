package com.project.BookStore.User.Service;

import com.project.BookStore.Auth.Utils.SecurityUtil;
import com.project.BookStore.Common.Enum.IdentifierType;
import com.project.BookStore.Common.Utils.IdentifierUtils;
import com.project.BookStore.User.DTO.Request.*;
import com.project.BookStore.Common.Response.PageResponse;
import com.project.BookStore.User.DTO.Response.ProfileUpdateResponse;
import com.project.BookStore.User.DTO.Response.UserResponse;
import com.project.BookStore.User.DTO.Response.UserUpdateResponse;
import com.project.BookStore.User.Entity.User;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.User.Mapper.UserMapper;
import com.project.BookStore.User.Repository.UserRepository;
import com.project.BookStore.Auth.Service.Role.RoleServiceImpl;
import com.project.BookStore.Common.Service.Cloudinary.CloudinaryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.AbstractHandlerMethodAdapter;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserServiceImpl implements UserService {

    final UserMapper userMapper;
    final UserRepository userRepository;
    final PasswordEncoder passwordEncoder;
//    private final UserContextService userContextService;
    final RoleServiceImpl roleService;
    final SecurityUtil securityUtil;
    final CloudinaryService cloudinaryService;
    private final AbstractHandlerMethodAdapter abstractHandlerMethodAdapter;


    @Override
    public UserResponse createUser(UserCreationRequest request) {
        checkUserExist(request,null,
                UserCreationRequest::getUserName,
                UserCreationRequest::getEmail,
                UserCreationRequest::getPhone);
        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        var roles = roleService.validateRoleIDs(request.getRoles());
        user.setRoles(new HashSet<>(roles));
        userRepository.save(user);
        UserResponse userResponse = userMapper.toResponse(user);
        return userResponse;
    }

    @Override
    @PreAuthorize("isAuthenticated()")
    public UserResponse myInfo() {

        User user = securityUtil.getCurrentUser();

        return userMapper.toResponse(user);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<UserResponse> getUsers(Pageable  pageable) {
        int pageNumber = pageable.getPageNumber() - 1;
        pageNumber = Math.max(pageNumber, 0);
        int maxSize = 10;
        Pageable safePageable = PageRequest.of(
                pageNumber,
                Math.min(pageable.getPageSize(), maxSize),
                pageable.getSort().isSorted()
                        ? pageable.getSort()
                        : Sort.by("id").descending()
        );

        Page<User> page = userRepository.findAll(safePageable);
        List<UserResponse> data = page.getContent().stream()
                .map(userMapper::toResponse)
                .toList();
        return PageResponse.<UserResponse>builder()
                .data(data)
                .page(page.getNumber()  + 1)
                .size(page.getSize())
                .total(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    public UserUpdateResponse updateUser(Long id, UserUpdateRequest request) {
        Optional<User> userOptional = userRepository.findById(id);
        User user = userOptional.orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        checkUserExist(request, id,
                UserUpdateRequest::getUserName,
                UserUpdateRequest::getEmail,
                UserUpdateRequest::getPhone);
        userMapper.updateUser(user, request);
        userRepository.save(user);
        return userMapper.toUpdateResponse(user);
    }

    @Override
    public void softDeleteUser(Long id) {
        Optional<User> userOptional = userRepository.findById(id);
        User user = userOptional.orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        user.setDeleted(true);
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Override
    public ProfileUpdateResponse updateMyProfile(ProfileUpdateRequest request) {
        User user = securityUtil.getCurrentUser();
        Long id = user.getId();

        if (request.getPhone() != null && request.getPhone().trim().isEmpty()) {
            request.setPhone(null);
        }

        checkUserExist(request, id,
                ProfileUpdateRequest::getUserName,
                ProfileUpdateRequest::getEmail,
                ProfileUpdateRequest::getPhone);

        userMapper.updateProfile(user, request);
        userRepository.save(user);
        return  userMapper.toUpdateProfile(user);
    }

    @Override
    public UserResponse updateMyAvatar(AvatarUpdateRequest request) {
        User user = securityUtil.getCurrentUser();
        String url = request.getAvatarUrl();
        if (url == null || url.trim().isEmpty()) {
            user.setAvatarUrl(null);
        } else {
            user.setAvatarUrl(url);
        }
        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Override
    public Map<String, Object> getAvatarUploadSignature() {
        return cloudinaryService.getUploadSignature("userAvatars");
    }

    @Override
    public void restoreUser(Long userId) {
        Optional<User> userOptional = userRepository.findById(userId);
        User user = userOptional.orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if(!user.isDeleted()){
            throw new AppException(ErrorCode.USER_NOT_DELETED);
        }
        user.setDeleted(false);
        user.setDeletedAt(null);
        userRepository.save(user);
    }

    @Override
    public void changePassword(ChangePasswordRequest request) {
        User user = securityUtil.getCurrentUser();
        boolean checkPassword = passwordEncoder.matches(request.getOldPassword() , user.getPassword());
        if(!checkPassword){
            throw new AppException(ErrorCode.OLD_PASSWORD_INCORRECT);
        }
        if(request.getOldPassword().equals(request.getNewPassword())){
            throw new AppException(ErrorCode.DUPLICATE_OLE_PASSWORD);
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public void changeUserStatus(Long userId, ChangeUserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        user.setStatus(request.getStatus());
        userRepository.save(user);
    }


    public User findUser(String identifier) {
        IdentifierType type = IdentifierUtils.detect(identifier);

        return switch (type) {
            case EMAIL -> userRepository.findByEmail(identifier)
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

            case PHONE -> userRepository.findByPhone(identifier)
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

            case USERNAME -> userRepository.findByUserName(identifier)
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));
        };
    }
    private <T> void checkUserExist(
            T dto,
            Long id,
            Function<T, String> getUserName,
            Function<T, String> getEmail,
            Function<T, String> getPhone
    ) {

        String userName = getUserName.apply(dto);
        String email = getEmail.apply(dto);
        String phone = getPhone.apply(dto);

        if (id == null) {
            // userName có thể null với OAuth users — chỉ check khi có giá trị
            if (userName != null && userRepository.existsUserByUserName(userName))
                throw new AppException(ErrorCode.USER_EXISTED);
            if (email != null && userRepository.existsByEmail(email))
                throw new AppException(ErrorCode.EMAIL_EXISTED);
            if (phone != null && userRepository.existsUserByPhone(phone))
                throw new AppException(ErrorCode.PHONE_EXISTED);
        } else {
            if (userName != null && userRepository.existsUserByUserNameAndIdNot(userName, id))
                throw new AppException(ErrorCode.USER_EXISTED);
            if (email != null && userRepository.existsUserByEmailAndIdNot(email, id))
                throw new AppException(ErrorCode.EMAIL_EXISTED);
            if (phone != null && userRepository.existsUserByPhoneAndIdNot(phone, id))
                throw new AppException(ErrorCode.PHONE_EXISTED);
        }
    }
}
