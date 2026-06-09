package com.project.BookStore.Auth.Strategy;

import com.project.BookStore.Auth.DTO.Request.LocalLoginRequest;
import com.project.BookStore.Common.Enum.LoginType;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Common.Utils.CookieUtils;
import com.project.BookStore.User.Entity.User;
import com.project.BookStore.User.Entity.UserProvider;
import com.project.BookStore.User.Repository.UserProviderRepository;
import com.project.BookStore.User.Service.UserServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class IdentifierStrategy implements AuthStrategy {
    final UserServiceImpl userService;
    final PasswordEncoder passwordEncoder;
    final UserProviderRepository userProviderRepository;

    @Override
    public LoginType getLoginType() {
        return LoginType.LOCAL;
    }

    @Override
    public User authenticate(Object request) {
        LocalLoginRequest localReq = (LocalLoginRequest) request;
        User user = userService.findUser(localReq.getIdentifier());
        if (!user.isEmailVerified()) {
            throw new AppException(ErrorCode.USER_NOT_VERIFIED);
        }
        boolean authenticate = passwordEncoder.matches(localReq.getPassword() , user.getPassword());
        if(!authenticate){
            throw  new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
        return  user;

    }
}