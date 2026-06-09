package com.project.BookStore.User.DTO.Request;

import com.project.BookStore.User.Enum.UserStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChangeUserStatusRequest {
    private UserStatus status;
}