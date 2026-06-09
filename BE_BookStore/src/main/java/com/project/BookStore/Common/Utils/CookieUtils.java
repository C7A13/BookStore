package com.project.BookStore.Common.Utils;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import ch.qos.logback.core.util.Duration;

@Component
public class CookieUtils {
    @Value("${jwt.refresh-token-expiration}")
    private long refreshTokenExpiration;

    public void addRefreshTokenToCookie(HttpServletResponse response, String token, boolean remember) {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", token)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(remember ? refreshTokenExpiration : -1)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    public void addRefreshTokenToCookie(HttpServletResponse response, String token) {
        addRefreshTokenToCookie(response, token, true);
    }


    public void addCartSessionCookie(HttpServletResponse response, String sessionToken) {
        ResponseCookie cookie = ResponseCookie.from("cart_session", sessionToken)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(30 * 24 * 60 * 60)
                .sameSite("Strict")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    public void clearCartSessionCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("cart_session", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }

    public void clearRefreshToken(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();
        response.addHeader("Set-Cookie", cookie.toString());
    }
}
