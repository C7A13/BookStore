package com.project.BookStore.Common.Config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {
    @Value("${cloudinary.cloud_name}")
    private  String cloudName;

    @Value("${cloudinary.api_key}")
    private  String cloudApiKey;

    @Value("${cloudinary.api_secret}")
    private  String cloudApiSecret;

    @Bean
    public Cloudinary cloudinary(){
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name" ,cloudName ,
                        "api_key",cloudApiKey,
                        "api_secret" ,cloudApiSecret
        ));
    }

}
