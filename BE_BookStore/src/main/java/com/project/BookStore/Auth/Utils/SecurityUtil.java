package com.project.BookStore.Auth.Utils;

import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.User.Entity.User;
import com.project.BookStore.User.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtil {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        String username = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByUserName(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
    }
    public Long getCurrentUserId() {
        User user = getCurrentUser();
        return user.getId();
    }

}