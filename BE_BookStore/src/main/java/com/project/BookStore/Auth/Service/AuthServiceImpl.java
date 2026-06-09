package com.project.BookStore.Auth.Service;

import com.nimbusds.jwt.JWTClaimsSet;
import com.project.BookStore.Auth.DTO.Request.LocalLoginRequest;
import com.project.BookStore.Auth.DTO.Request.RegisterRequest;
import com.project.BookStore.Auth.DTO.Request.SocialLoginRequest;
import com.project.BookStore.Auth.DTO.Response.AuthResponse;
import com.project.BookStore.Auth.Entity.Role;
import com.project.BookStore.Auth.Strategy.AuthStrategy;
import com.project.BookStore.Auth.Strategy.GoogleStrategy;
import com.project.BookStore.Auth.Strategy.IdentifierStrategy;
import com.project.BookStore.User.Entity.Customer;
import com.project.BookStore.User.Entity.User;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Auth.Mapper.RegisterMapper;
import com.project.BookStore.Auth.Repository.RoleRepository;
import com.project.BookStore.User.Repository.CustomerRepository;
import com.project.BookStore.User.Repository.UserRepository;
import com.project.BookStore.Auth.Service.Jwt.JwtService;
import com.project.BookStore.Auth.Service.RefreshToken.RefreshTokenService;
import com.project.BookStore.Common.Utils.CookieUtils;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthServiceImpl implements AuthService {

    final CookieUtils cookieUtils;
    final RefreshTokenService refreshTokenService;
    final UserRepository userRepository;
    final PasswordEncoder passwordEncoder;
    final JwtService jwtService;
    final RegisterMapper  registerMapper;
    final RoleRepository roleRepository;
    final RedisTemplate<String , Object> redisTemplate;
    final IdentifierStrategy identifierStrategy;
    final CustomerRepository customerRepository;
    final EmailVerificationService emailVerificationService;
    private final List<AuthStrategy> authStrategies;

    @Override
    @Transactional
    public void register(RegisterRequest request) {
                if(userRepository.existsUserByUserName(request.getUserName())){
                    throw new AppException(ErrorCode.USER_EXISTED);
                }
                if (userRepository.existsByEmail(request.getEmail())) {
                    throw new AppException(ErrorCode.EMAIL_EXISTED);
                }

                User user = registerMapper.toUser(request);

                user.setPassword(passwordEncoder.encode(request.getPassword()));

                Role roleUser = roleRepository.findByName("USER")
                        .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

                user.setRoles(Set.of(roleUser));
                userRepository.save(user);

                Customer customer = new Customer();
                customer.setUser(user);
                customerRepository.save(customer);
                emailVerificationService.sendVerificationEmail(request.getEmail());

    }

    @Override
    public AuthResponse login(LocalLoginRequest request  , HttpServletResponse response) {
        User user = identifierStrategy.authenticate(request);
        var accessToken = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.createRefreshToken(user);

        cookieUtils.addRefreshTokenToCookie(response, refreshToken, request.isRemember());

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        return AuthResponse.builder()
                .token(accessToken)
                .build();

    }

    @Override
    @Transactional
    public AuthResponse loginSocial(SocialLoginRequest request, HttpServletResponse response) {
        AuthStrategy strategy = authStrategies.stream()
                .filter(s -> s.getLoginType() == request.getLoginType())
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_LOGIN_TYPE));

        User user = strategy.authenticate(request);
        var accessToken = jwtService.generateAccessToken(user);
        String refreshToken = refreshTokenService.createRefreshToken(user);

        cookieUtils.addRefreshTokenToCookie(response, refreshToken);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        return AuthResponse.builder()
                .token(accessToken)
                .build();
    }

    @Override
    public AuthResponse refresh(String token) {
        Long userId = refreshTokenService.verifyRefreshToken(token);
        User user = userRepository.findByIdWithRolesAndPermissions(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        var accessToken = jwtService.generateAccessToken(user);
        return AuthResponse.builder()
                .token(accessToken)
                .build();
    }

    @Override
    public void logout(String authorization,
                       String refreshToken,
                       HttpServletResponse response) {

        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return;
        }

        String accessToken = authorization.substring(7);

        JWTClaimsSet claims = jwtService.verifyToken(accessToken);

        String tokenId = claims.getJWTID();

        Date expirationTime = claims.getExpirationTime();

        long ttl = expirationTime.getTime() - System.currentTimeMillis();

        if (ttl > 0) {
            redisTemplate.opsForValue().set(
                    "blacklist:" + tokenId,
                    "true",
                    Duration.ofMillis(ttl)
            );
        }

        refreshTokenService.deleteRefreshToken(refreshToken);
        cookieUtils.clearRefreshToken(response);
    }


}
