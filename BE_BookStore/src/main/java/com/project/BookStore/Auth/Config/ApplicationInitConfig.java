package com.project.BookStore.Auth.Config;

import com.project.BookStore.User.Enum.UserStatus;
import com.project.BookStore.User.Entity.User;
import com.project.BookStore.User.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
@RequiredArgsConstructor
public class ApplicationInitConfig {
    private  final PasswordEncoder passwordEncoder;


    ApplicationRunner applicationRunner (UserRepository userRepository){
        return args -> {
            if(userRepository.findByUserName("Admin").isEmpty()){
                User user = User.builder()
                        .userName("Admin")
                        .fullName("Chon")
                        .password(passwordEncoder.encode("admin"))
                        .dob(LocalDate.parse("2004-01-09"))
                        .isEmailVerified(false)
                        .isPhoneVerified(false)
                        .email("Admin@gmail.com")
                        .phone("02323232332")
                        .status(UserStatus.ACTIVE)
                        .build();

                userRepository.save(user);
            }
        };
    }
}
