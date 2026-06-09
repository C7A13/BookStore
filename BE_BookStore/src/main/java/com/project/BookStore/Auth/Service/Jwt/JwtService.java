package com.project.BookStore.Auth.Service.Jwt;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.project.BookStore.User.Entity.User;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.User.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JwtService {
    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    final UserRepository userRepository;
    final PasswordEncoder passwordEncoder;

    @Value("${jwt.signerKey}")
    private String signerKey ;

    @Value("${jwt.access-token-expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.verify.signerKey}")
    private String verifyKey ;


    public String generateAccessToken(User user){
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

         long expMs = accessTokenExpiration * 1000;

       JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUserName())
                .issuer("project.com")
               .jwtID(UUID.randomUUID().toString())
                .issueTime(new Date())
                .expirationTime(new Date(System.currentTimeMillis() + expMs))
                .claim("id" , user.getId())
                .claim("roles" , user.getRoles().stream().map(role -> "ROLE_" + role.getName()).toList() )
                .claim("scope" , buildScope(user))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header  , payload);

        try{
            jwsObject.sign(new MACSigner(signerKey.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token");
            throw new RuntimeException(e);
        }
    }

    public JWTClaimsSet verifyToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);

            JWSVerifier verifier = new MACVerifier(signerKey.getBytes());
            if (!signedJWT.verify(verifier)) {
                throw new AppException(ErrorCode.INVALID_TOKEN);
            }

            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();

            Date expirationTime = claims.getExpirationTime();
            if (expirationTime == null || expirationTime.before(new Date())) {
                throw new AppException(ErrorCode.TOKEN_EXPIRED);
            }
            return claims;
        } catch (JOSEException | java.text.ParseException e) {
            log.error("Token verification failed", e);
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

    private  String buildScope(User user){
        Set<String> perms = new HashSet<>();
        if(!CollectionUtils.isEmpty(user.getRoles())){
            user.getRoles().forEach(role -> {
                if(!CollectionUtils.isEmpty(role.getPermissions())){
                    role.getPermissions().forEach(p -> perms.add(p.getName()));
                }
            });
        }
        return String.join(" ", perms);
    }

    public String generateVerificationToken(String email) {
        try {
            // 1. Tạo Payload chứa thông tin email và hạn dùng 24h
            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(email)
                    .issueTime(new Date())
                    .expirationTime(new Date(new Date().getTime() + 15 * 60 * 1000))
                    .build();

            // 2. Ký token bằng thuật toán HS256 và khóa verifyKey bí mật của bạn
            SignedJWT signedJWT = new SignedJWT(
                    new JWSHeader(JWSAlgorithm.HS256),
                    claimsSet
            );

            // 3. Tiến hành mã hóa chuỗi kí tự
            signedJWT.sign(new MACSigner(verifyKey.getBytes(java.nio.charset.StandardCharsets.UTF_8)));

            return signedJWT.serialize();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi sinh mã xác thực bằng Nimbus: " + e.getMessage());
        }
    }
}
