package com.project.BookStore.Auth.Service.RefreshToken;

import com.project.BookStore.Auth.Entity.RefreshToken;
import com.project.BookStore.User.Entity.User;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Auth.Repository.RefreshTokenRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RefreshTokenService {
    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    final RefreshTokenRepository refreshTokenRepository;
    final RedisTemplate<String , Object> redisTemplate;

    public String createRefreshToken(User user){
        String token = UUID.randomUUID().toString() ;

        RefreshToken refreshToken = new RefreshToken(token , user.getId());

        refreshTokenRepository.save(refreshToken);

        String redisKey = "refresh_token:" + token;
        return  token;
    }

    public RefreshToken getRefreshToken(String token) {
        return refreshTokenRepository.findById(token)
                .orElseThrow(() -> new AppException(ErrorCode.REFRESH_TOKEN_NOT_EXIST));
    }

    public Long verifyRefreshToken(String token){
        RefreshToken refreshToken = refreshTokenRepository.findById(token)
                .orElseThrow(() -> new AppException(ErrorCode.REFRESH_TOKEN_NOT_EXIST));

        String redisKey = "refresh_token:" + token;
        Long ttl = redisTemplate.getExpire(redisKey,TimeUnit.SECONDS);
        if(ttl == null || ttl <=0 ){
            refreshTokenRepository.deleteById(token);
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        if(refreshToken.getUserId() == null){
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        return refreshToken.getUserId();
    }

    public void deleteRefreshToken(String token) {
        refreshTokenRepository.deleteById(token);
    }

}
