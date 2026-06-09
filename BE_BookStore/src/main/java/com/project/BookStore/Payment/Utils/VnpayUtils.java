package com.project.BookStore.Payment.Utils;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.util.StringUtils;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

public class VnpayUtils {

    private VnpayUtils() {}

    /**
     * Tạo chữ ký HMAC-SHA512 cho VNPay
     */
    public static String hmacSHA512(String key, String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            mac.init(secretKey);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * hash.length);
            for (byte b : hash) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Error computing HMAC-SHA512", e);
        }
    }

    /**
     * Lấy địa chỉ IP thực của client (hỗ trợ proxy/load balancer)
     */
    public static String getIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (!StringUtils.hasText(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (!StringUtils.hasText(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (!StringUtils.hasText(ip) || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // Lấy IP đầu tiên nếu có nhiều IP
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        // Chuyển đổi IP localhost IPv6 thành IPv4 hợp lệ cho VNPay
        if ("0:0:0:0:0:0:0:1".equals(ip) || "::1".equals(ip)) {
            ip = "127.0.0.1";
        }
        return ip;
    }

    /**
     * Tạo ngẫu nhiên mã giao dịch (TxnRef) duy nhất
     * Format: YYYYMMDDHHMMSS + random 6 ký tự
     */
    public static String generateTxnRef() {
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        String timestamp = sdf.format(new Date());
        String random = String.valueOf((int) (Math.random() * 900000) + 100000);
        return timestamp + random;
    }

    /**
     * Tạo chuỗi hashData để ký HMAC-SHA512 theo chuẩn VNPay 2.1.0.
     * VNPay yêu cầu các giá trị phải được URL-encode (khoảng trắng = '+').
     */
    public static String buildHashData(Map<String, String> params) {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        for (String field : fieldNames) {
            String value = params.get(field);
            if (StringUtils.hasText(value)) {
                if (hashData.length() > 0) hashData.append('&');
                try {
                    hashData.append(field).append('=')
                            .append(URLEncoder.encode(value, StandardCharsets.UTF_8.toString()));
                } catch (Exception e) {
                    hashData.append(field).append('=').append(value);
                }
            }
        }
        return hashData.toString();
    }

    /**
     * Tạo query string URL-encoded từ params map đã sắp xếp
     */
    public static String buildQueryString(Map<String, String> params) {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        Collections.sort(fieldNames);

        StringBuilder query = new StringBuilder();
        for (String field : fieldNames) {
            String value = params.get(field);
            if (StringUtils.hasText(value)) {
                if (query.length() > 0) query.append('&');
                try {
                    query.append(URLEncoder.encode(field, StandardCharsets.UTF_8.toString()))
                         .append('=')
                         .append(URLEncoder.encode(value, StandardCharsets.UTF_8.toString()).replace("+", "%20"));
                } catch (Exception e) {
                    query.append(URLEncoder.encode(field, StandardCharsets.US_ASCII))
                         .append('=')
                         .append(URLEncoder.encode(value, StandardCharsets.US_ASCII));
                }
            }
        }
        return query.toString();
    }

    /**
     * Lấy timestamp hiện tại theo định dạng VNPay yêu cầu: yyyyMMddHHmmss
     */
    public static String getCurrentTimestamp() {
        return new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
    }

    /**
     * Lấy timestamp hết hạn (sau 15 phút)
     */
    public static String getExpireTimestamp(int minutesFromNow) {
        Calendar cal = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        cal.add(Calendar.MINUTE, minutesFromNow);
        return new SimpleDateFormat("yyyyMMddHHmmss").format(cal.getTime());
    }
}
