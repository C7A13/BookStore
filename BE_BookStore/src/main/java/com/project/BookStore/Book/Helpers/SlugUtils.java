package com.project.BookStore.Book.Helpers;

import java.text.Normalizer;
import java.util.regex.Pattern;

public class SlugUtils {

    private SlugUtils() {}

    public static String toSlug(String input) {
        if (input == null) return "";

        // Bước 1: Normalize Unicode → tách dấu ra khỏi chữ
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);

        // Bước 2: Xóa dấu
        String withoutAccent = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        // Bước 3: Xử lý ký tự đặc biệt tiếng Việt còn sót
        withoutAccent = withoutAccent
                .replace("đ", "d").replace("Đ", "d")
                .replace("ơ", "o").replace("Ơ", "o")
                .replace("ư", "u").replace("Ư", "u");

        // Bước 4: Lowercase, chỉ giữ a-z 0-9 khoảng trắng gạch ngang
        String slug = withoutAccent.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-")         // khoảng trắng → gạch ngang
                .replaceAll("-{2,}", "-");        // nhiều gạch ngang → 1

        return slug;
    }
}

