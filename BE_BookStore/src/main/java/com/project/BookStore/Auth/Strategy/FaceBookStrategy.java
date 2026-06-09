package com.project.BookStore.Auth.Strategy;

import com.project.BookStore.Auth.DTO.Request.SocialLoginRequest;
import com.project.BookStore.Auth.DTO.Response.FacebookTokenResponse;
import com.project.BookStore.Auth.DTO.Response.FacebookUserResponse;
import com.project.BookStore.Auth.Entity.Role;
import com.project.BookStore.Auth.Repository.RoleRepository;
import com.project.BookStore.Common.Config.FacebookClient;
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
public class FaceBookStrategy implements AuthStrategy{

    final FacebookClient facebookClient;
    final UserProviderRepository userProviderRepository;
    final UserRepository userRepository;
    final RoleRepository roleRepository;
    final UsernameGenerator usernameGenerator;

    @Override
    public LoginType getLoginType() {
        return LoginType.FACEBOOK;
    }

    @Override
    @Transactional
    public User authenticate(Object request) {
        SocialLoginRequest facebookReq = ( SocialLoginRequest) request;

        FacebookTokenResponse tokenResponse = facebookClient.exchangeToken(facebookReq.getCode());
        FacebookUserResponse userInfo = facebookClient.getUserInfo(tokenResponse.getAccessToken());

        String facebookUserId = userInfo.getId();
        String rawEmail = userInfo.getEmail();
        final String email = (rawEmail != null && !rawEmail.isEmpty()) ? rawEmail : facebookUserId + "@facebook.com";
        return userProviderRepository.findByProviderAndProviderId(LoginType.FACEBOOK.toString(), facebookUserId)
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
                                .avatarUrl("https://graph.facebook.com/" + facebookUserId + "/picture?type=large")
                                .roles(Set.of(userRole))
                                .build();
                        existingUser = userRepository.save(existingUser);
                    } else if (existingUser.getAvatarUrl() == null) {
                        existingUser.setAvatarUrl("https://graph.facebook.com/" + facebookUserId + "/picture?type=large");
                        existingUser = userRepository.save(existingUser);
                    }

                    UserProvider newProviderLink = UserProvider.builder()
                            .user(existingUser)
                            .provider(getLoginType().toString())
                            .providerId(facebookUserId)
                            .build();
                    userProviderRepository.save(newProviderLink);
                    return existingUser;
                 });
    }
}
