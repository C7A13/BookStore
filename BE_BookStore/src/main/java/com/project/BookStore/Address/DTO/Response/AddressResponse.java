package com.project.BookStore.Address.DTO.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {
    Long id;

    String recipientName;

    String recipientPhone;

    String province;

    String ward;

    String detailAddress;

    Boolean isDefault;
    Long userId;
    String userName;
    String userEmail;
    java.time.LocalDateTime createdAt;
}
