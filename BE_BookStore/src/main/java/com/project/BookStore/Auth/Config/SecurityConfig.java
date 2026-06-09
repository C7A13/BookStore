package com.project.BookStore.Auth.Config;

import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Common.Exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.spec.SecretKeySpec;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    final  RedisTemplate<String , Object> redisTemplate;

    final  CustomAccessDeniedHandler customAccessDeniedHandler;
    @Value("${jwt.signerKey}")
    private String signerKey ;

    @Value("${jwt.verify.signerKey}")
    private String verifyKey ;



    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }
    private  final  String[] PUBLIC_ENDPOINTS = {
            "/auth/login","/auth/login/social", "/auth/refresh", "/auth/register", "/cart/**",
            "/payments/vnpay/ipn", "/payments/vnpay/return","/auth/verify",
            "/auth/forgot-password","/auth/reset-password","/oauth2/**",
            "/books/**", "/categories/**", "/publishers/**", "/authors/**"
    };
    private final String[] ADMIN_ENDPOINTS = {"/admin/**"};

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity
                .cors(cors -> cors.configure(httpSecurity))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.GET, PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.PUT, PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.DELETE, PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.GET, ADMIN_ENDPOINTS).hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, ADMIN_ENDPOINTS).hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, ADMIN_ENDPOINTS).hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, ADMIN_ENDPOINTS).hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, ADMIN_ENDPOINTS).hasRole("ADMIN")
                        .requestMatchers("/login/**").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .accessDeniedHandler(customAccessDeniedHandler)
                )
                .oauth2Login(oauth2 -> oauth2
                        .defaultSuccessUrl("/auth/login/social-success", true)
                )
                // oauth2Login() đã bị xoá vì xung đột với manual code-exchange flow.
                // Flow hiện tại: FE nhận code từ Google/FB → POST lên /auth/login/social → BE xử lý thủ công
                // ==========================================================
                .oauth2ResourceServer(oauth2 ->
                        oauth2
                                .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
                                .jwt(jwtConfigurer -> jwtConfigurer
                                        .decoder(loginJwtDecoder())
                                        .jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );
        return httpSecurity.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter(){
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Set<GrantedAuthority> authorities = new HashSet<>();
            List<String> roles = jwt.getClaimAsStringList("roles");
            if (roles != null) {
                roles.forEach(r -> authorities.add(new SimpleGrantedAuthority(r)));
            }
            String scope = jwt.getClaimAsString("scope");
            if (scope != null && !scope.trim().isEmpty()) {
                authorities.add(new SimpleGrantedAuthority(scope));
            }
            return authorities;
        });
        return converter;
    }
    @Bean(name = "loginJwtDecoder")
    @Primary
    public JwtDecoder loginJwtDecoder(){
        SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes() , "HS512");
        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();

        return token -> {
            Jwt jwt = decoder.decode(token);
            String tokenId = jwt.getId();

            if (tokenId != null) {
                Boolean isBlacklisted = redisTemplate.hasKey("blacklist:" + tokenId);
                if (Boolean.TRUE.equals(isBlacklisted)) {
                    throw new AppException(ErrorCode.UNAUTHENTICATED);
                }
            }
            return jwt;
        };
    }

    @Bean(name = "verifyJwtDecoder")
    public JwtDecoder verifyJwtDecoder() {
        SecretKeySpec secretKeySpec = new SecretKeySpec(verifyKey.getBytes(), "HS256");
        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
        return token -> decoder.decode(token);
    }


}
