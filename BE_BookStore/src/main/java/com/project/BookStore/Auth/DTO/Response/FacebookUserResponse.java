package com.project.BookStore.Auth.DTO.Response;


import lombok.Data;

@Data
public class FacebookUserResponse {
    private String id;       // Khóa định danh duy nhất của FB (provider_id)
    private String email;    // Email tài khoản FB
    private String name;     // Họ tên đầy đủ
}