package com.project.BookStore.Common.Config;

import com.project.BookStore.Auth.DTO.Response.FacebookTokenResponse;
import com.project.BookStore.Auth.DTO.Response.FacebookUserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class FacebookClient {


    @Value("${facebook.client-id}")
    private String clientId;

    @Value("${facebook.client-secret}")
    private String clientSecret;

    @Value("${facebook.redirect-uri}")
    private String redirectUri;

    private final RestTemplate restTemplate = new RestTemplate();

    // 🎯 1. Đổi code lấy Access Token (Y hệt hàm exchangeToken của Google)
    public FacebookTokenResponse exchangeToken(String code) {
        String url = "https://graph.facebook.com/v18.0/oauth/access_token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri",redirectUri);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        return restTemplate.postForObject(url, request, FacebookTokenResponse.class);
    }

    // 🎯 2. Lấy thông tin User (Y hệt hàm getUserInfo của Google)
    public FacebookUserResponse getUserInfo(String accessToken) {
        String url = "https://graph.facebook.com/me?fields=id,name,email" + "&access_token=" + accessToken;
        return restTemplate.getForObject(url, FacebookUserResponse.class);
    }
}