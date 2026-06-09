package com.project.BookStore.Auth.Service;

import com.project.BookStore.Auth.Service.Jwt.JwtService;
import com.project.BookStore.Auth.Utils.EmailUtils;
import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.User.Entity.User;
import com.project.BookStore.User.Repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.access.method.P;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class EmailVerificationService {

    @Value("${brevo.api.key}")
    private String apiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${jwt.verify.signer-key}")
    private String verifyKey;

    private final UserRepository userRepository;
    private final JwtDecoder verifyJwtDecoder;
    final JwtService jwtService;
    final EmailUtils emailUtils;
    final PasswordEncoder passwordEncoder;

    // Inject UserRepository và đúng bộ giải mã verifyJwtDecoder (HS256 thuần)
    public EmailVerificationService(UserRepository userRepository,
                                    @Qualifier("verifyJwtDecoder") JwtDecoder verifyJwtDecoder, JwtService jwtService , EmailUtils emailUtils , PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.verifyJwtDecoder = verifyJwtDecoder;
        this.jwtService = jwtService;
        this.emailUtils = emailUtils;
        this.passwordEncoder = passwordEncoder;
    }



    public void sendVerificationEmail(String recipientEmail) {
            String token = jwtService.generateVerificationToken(recipientEmail);
            String verificationLink = "http://localhost:8080/auth/verify?token=" + token;

            String htmlContent = String.format(
                    "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;'>" +
                            "   <h3 style='color: #28a745;'>Chào mừng bạn đến với BookStore!</h3>" +
                            "   <p>Vui lòng nhấn vào nút bên dưới để xác thực tài khoản của bạn:</p>" +
                            "   <div style='margin: 25px 0;'>" +
                            "       <a href='%s' style='padding: 12px 25px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>Xác thực ngay</a>" +
                            "   </div>" +
                            "   <p style='color: #666; font-size: 13px;'>Liên kết này chỉ có hiệu lực trong 15 phút.</p>" +
                            "</div>", verificationLink);

            // Gọi hàm chung để gửi đi
            emailUtils.sendEmailThuan(recipientEmail, "Xác thực tài khoản tại hệ thống BookStore", htmlContent);
    }

    public void sendForgotPasswordEmail(String recipientEmail) {
        // Check tài khoản tồn tại trước khi cho phép gửi mail
        userRepository.findByEmail(recipientEmail)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String token =jwtService.generateVerificationToken(recipientEmail); // 15 phút cho bảo mật
        String resetLink = "http://localhost:3000/reset-password?token=" + token;

        String htmlContent = String.format(
                "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;'>" +
                        "   <h3 style='color: #dc3545;'>Yêu cầu đặt lại mật khẩu</h3>" +
                        "   <p>Bạn nhận được thư này vì đã yêu cầu cấp lại mật khẩu. Vui lòng bấm vào nút bên dưới để tiến hành đổi mật khẩu mới:</p>" +
                        "   <div style='margin: 25px 0;'>" +
                        "       <a href='%s' style='padding: 12px 25px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;'>Đặt lại mật khẩu</a>" +
                        "   </div>" +
                        "   <p style='color: #666; font-size: 13px;'>Liên kết này có hiệu lực trong vòng 15 phút. Nếu bạn không yêu cầu điều này, xin vui lòng bỏ qua email.</p>" +
                        "</div>", resetLink);

        // Gọi hàm chung để gửi đi
        emailUtils.sendEmailThuan(recipientEmail, "Yêu cầu đặt lại mật khẩu - BookStore", htmlContent);
    }

    @Transactional
    public void verifyTokenAndActivateUser(String token) {
        // Gọi hàm chung để lấy User (đã được tự động check lỗi token bên trong)
        User user = getUserFromToken(token);

        if (user.isEmailVerified()) return;

        // Xử lý logic riêng: Bật tích kích hoạt
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        User user = getUserFromToken(token);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }


    private User getUserFromToken(String token) {
        try {
            Jwt jwt = verifyJwtDecoder.decode(token);
            String email = jwt.getSubject();


            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            String errorMessage = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
            if (errorMessage.contains("expired") || errorMessage.contains("exp")) {
                throw new AppException(ErrorCode.TOKEN_EXPIRED);
            } else {
                throw new AppException(ErrorCode.INVALID_TOKEN);
            }
        }
    }

}