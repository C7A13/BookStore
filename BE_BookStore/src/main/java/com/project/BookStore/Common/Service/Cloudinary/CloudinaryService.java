package com.project.BookStore.Common.Service.Cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.project.BookStore.Common.Exception.AppException;
import com.project.BookStore.Common.Enum.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {
    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud_name}")
    private String cloudName;

    @Value("${cloudinary.api_key}")
    private String apiKey;

    @Value("${cloudinary.api_secret}")
    private String apiSecret;


    public String uploadImage(MultipartFile file , String customId ) {
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "bookImage",
                            "public_id", customId,
                            "overwrite", true
                    ));
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new AppException(ErrorCode.FILE_UPLOAD_ERROR);
        }

    }
    public void delete(String publicId) {
        try {
            Map<?, ?> result = cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap(
                            "resource_type", "image",
                            "invalidate", true
                    )
            );

            String status = result.get("result").toString();

            if (!status.equals("ok") && !status.equals("not found")) {
                throw new AppException(ErrorCode.FILE_DELETE_ERROR);
            }

        } catch (Exception e) {
            throw new AppException(ErrorCode.FILE_DELETE_ERROR);
        }
    }

    public Map<String, Object> getUploadSignature(String folder) {
        long timestamp = System.currentTimeMillis() / 1000L;
        Map<String, Object> params = ObjectUtils.asMap(
                "timestamp", timestamp,
                "folder", folder
        );
        String signature = cloudinary.apiSignRequest(params, apiSecret);

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("signature", signature);
        response.put("timestamp", timestamp);
        response.put("apiKey", apiKey);
        response.put("cloudName", cloudName);
        response.put("folder", folder);

        return response;
    }

}

