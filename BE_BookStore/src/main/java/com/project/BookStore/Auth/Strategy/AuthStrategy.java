package com.project.BookStore.Auth.Strategy;

import com.project.BookStore.Common.Enum.LoginType;
import com.project.BookStore.User.Entity.User;

public interface AuthStrategy {
    LoginType getLoginType();
    User authenticate(Object request);
}