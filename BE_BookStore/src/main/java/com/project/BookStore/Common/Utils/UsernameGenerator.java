package com.project.BookStore.Common.Utils;

import com.project.BookStore.User.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Utility để tự động sinh username cho user đăng ký qua OAuth (Google, Facebook).
 * Format: [tên hợp lệ từ email/name]_[4 ký tự ngẫu nhiên]
 * Đảm bảo username duy nhất và tuân thủ validation: ^[A-Za-z][A-Za-z0-9_]*$
 */
@Component
@RequiredArgsConstructor
public class UsernameGenerator {

    private final UserRepository userRepository;

    /**
     * Sinh username từ email (lấy phần trước @) hoặc fullName.
     * Nếu cả hai đều không dùng được, dùng "user" làm base.
     */
    public String generateFromEmail(String email, String fullName) {
        String base = extractBase(email, fullName);
        return buildUniqueUsername(base);
    }

    // -----------------------------------------------------------------------

    private String extractBase(String email, String fullName) {
        // Ưu tiên lấy phần local của email (trước @)
        if (email != null && email.contains("@")) {
            String local = email.split("@")[0];
            String cleaned = sanitize(local);
            if (!cleaned.isEmpty()) return cleaned;
        }
        // Fallback: dùng fullName
        if (fullName != null && !fullName.isBlank()) {
            String cleaned = sanitize(fullName.replace(" ", "_"));
            if (!cleaned.isEmpty()) return cleaned;
        }
        return "user";
    }

    /**
     * Loại bỏ dấu tiếng Việt, giữ lại ký tự a-z, 0-9, _
     * Đảm bảo bắt đầu bằng chữ cái.
     */
    private String sanitize(String input) {
        // Normalize unicode (loại dấu tiếng Việt)
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String withoutDiacritics = pattern.matcher(normalized).replaceAll("");

        // Giữ lại chữ + số + gạch dưới
        String cleaned = withoutDiacritics.toLowerCase().replaceAll("[^a-z0-9_]", "");

        // Đảm bảo bắt đầu bằng chữ cái
        cleaned = cleaned.replaceAll("^[^a-z]+", "");

        // Giới hạn độ dài base tối đa 20 ký tự
        if (cleaned.length() > 20) {
            cleaned = cleaned.substring(0, 20);
        }
        return cleaned;
    }

    /**
     * Thêm suffix ngẫu nhiên và kiểm tra DB đến khi tìm được username chưa tồn tại.
     */
    private String buildUniqueUsername(String base) {
        if (base.isEmpty()) base = "user";

        String candidate;
        int maxAttempts = 10;
        for (int i = 0; i < maxAttempts; i++) {
            String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 6);
            candidate = base + "_" + suffix;
            if (!userRepository.existsUserByUserName(candidate)) {
                return candidate;
            }
        }
        // Fallback cuối cùng: dùng toàn bộ UUID
        return "user_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
    }
}
