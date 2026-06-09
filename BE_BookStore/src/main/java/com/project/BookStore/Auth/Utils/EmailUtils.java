package com.project.BookStore.Auth.Utils;


import com.project.BookStore.Common.Enum.ErrorCode;
import com.project.BookStore.Common.Exception.AppException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import sendinblue.ApiClient;
import sendinblue.Configuration;
import sendinblue.auth.ApiKeyAuth;
import sibApi.TransactionalEmailsApi;
import sibModel.SendSmtpEmail;
import sibModel.SendSmtpEmailSender;
import sibModel.SendSmtpEmailTo;

import java.util.Collections;

@Component // Khai báo Component để Spring Boot tự quản lý và hỗ trợ Dependency Injection
public class EmailUtils {

    @Value("${brevo.api.key}")
    private String apiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    public void sendEmailThuan(String recipientEmail, String subject, String htmlContent) {
        try {

            ApiClient defaultClient = Configuration.getDefaultApiClient();
            ApiKeyAuth apiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("api-key");
            apiKeyAuth.setApiKey(apiKey);

            TransactionalEmailsApi apiInstance = new TransactionalEmailsApi();

            SendSmtpEmailSender sender = new SendSmtpEmailSender();
            sender.setEmail(senderEmail);
            sender.setName("Nhà Sách BookStore");

            SendSmtpEmailTo toItem = new SendSmtpEmailTo();
            toItem.setEmail(recipientEmail);

            SendSmtpEmail sendSmtpEmail = new SendSmtpEmail();
            sendSmtpEmail.setSender(sender);
            sendSmtpEmail.setTo(Collections.singletonList(toItem));

            sendSmtpEmail.setSubject(subject);
            sendSmtpEmail.setHtmlContent(htmlContent);

            apiInstance.sendTransacEmail(sendSmtpEmail);

        } catch (Exception e) {
            System.err.println("Lỗi gửi mail qua Brevo: " + e.getMessage());
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
    }
}