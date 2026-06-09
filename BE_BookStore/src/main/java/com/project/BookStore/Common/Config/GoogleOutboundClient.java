package com.project.BookStore.Common.Config;

import com.project.BookStore.Auth.DTO.Response.GoogleTokenResponse;
import com.project.BookStore.Auth.DTO.Response.GoogleUserResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Component
public class GoogleOutboundClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${outbound.identity.client-id}")
    private String clientId;

    @Value("${outbound.identity.client-secret}")
    private String clientSecret;

    @Value("${outbound.identity.redirect-uri}")
    private String redirectUri;

    // Hàm 1: Đổi mã 'code' lấy Access Token
    public GoogleTokenResponse exchangeToken(String code) {
        String url = "https://oauth2.googleapis.com/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        return restTemplate.postForObject(url, request, GoogleTokenResponse.class);
    }


    public GoogleUserResponse getUserInfo(String accessToken) {
        String url = "https://www.googleapis.com/oauth2/v3/userinfo?access_token=" + accessToken;
        return restTemplate.getForObject(url, GoogleUserResponse.class);
    }
}
