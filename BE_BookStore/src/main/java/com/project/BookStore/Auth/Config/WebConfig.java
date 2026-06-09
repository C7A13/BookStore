package com.project.BookStore.Auth.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class    WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Áp dụng cho tất cả API
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS" , "PATCH")
                .allowedHeaders("*") // Cho phép tất cả các Header
                .allowCredentials(true); // BẮT BUỘC phải có true để nhận/gửi Cookie chứa Refresh Token
    }
}
