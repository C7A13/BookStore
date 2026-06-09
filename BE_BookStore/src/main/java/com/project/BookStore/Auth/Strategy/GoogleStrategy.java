package com.project.BookStore.Auth.Strategy;

import com.project.BookStore.Auth.DTO.Request.SocialLoginRequest;
import com.project.BookStore.Auth.DTO.Response.GoogleTokenResponse;
import com.project.BookStore.Auth.DTO.Response.GoogleUserResponse;
import com.project.BookStore.Auth.Entity.Role;
import com.project.BookStore.Auth.Repository.RoleRepository;
import com.project.BookStore.Common.Config.GoogleOutboundClient;
import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Common.Enum.LoginType;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.User.Entity.User;
import com.project.BookStore.User.Entity.UserProvider;
import com.project.BookStore.User.Repository.UserProviderRepository;
import com.project.BookStore.User.Repository.UserRepository;
import com.project.BookStore.Common.Utils.UsernameGenerator;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
@RequiredArgsConstructor
public class GoogleStrategy implements AuthStrategy {

    private final GoogleOutboundClient googleOutboundClient;
    private final UserRepository userRepository;
    private final UserProviderRepository userProviderRepository;
    private final UsernameGenerator usernameGenerator;
    final RoleRepository roleRepository;

    @Override
    public LoginType getLoginType() {
        return LoginType.GOOGLE;
    }

    @Override
    @Transactional
    public User authenticate(Object request) {
        SocialLoginRequest googleReq = ( SocialLoginRequest) request;

        GoogleTokenResponse tokenResponse = googleOutboundClient.exchangeToken(googleReq.getCode());
        GoogleUserResponse userInfo = googleOutboundClient.getUserInfo(tokenResponse.getAccessToken());

        String googleUserId = userInfo.getId();
        String email = userInfo.getEmail();

        return userProviderRepository.findByProviderAndProviderId(LoginType.GOOGLE.toString(), googleUserId)
                .map(UserProvider::getUser)
                    .orElseGet(() -> {
                    User existingUser = userRepository.findByEmail(email).
                            orElse (null);

                    if (existingUser == null) {
                        Role userRole = roleRepository.findByName("USER")
                                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

                        String generatedUsername = usernameGenerator.generateFromEmail(email, userInfo.getName());
                        existingUser = User.builder()
                                .email(email)
                                .userName(generatedUsername)
                                .fullName(userInfo.getName())
                                .isEmailVerified(true)
                                .avatarUrl(userInfo.getPicture())
                                .roles(Set.of(userRole))
                                .build();
                        existingUser = userRepository.save(existingUser);
                    } else if (existingUser.getAvatarUrl() == null) {
                        existingUser.setAvatarUrl(userInfo.getPicture());
                        existingUser = userRepository.save(existingUser);
                    }

                    UserProvider newProviderLink = UserProvider.builder()
                            .user(existingUser)
                            .provider(getLoginType().toString())
                            .providerId(googleUserId)
                            .build();
                    userProviderRepository.save(newProviderLink);
                    return existingUser;
                });
    }
}
