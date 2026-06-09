package com.project.BookStore.Address.DTO.Request;

import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {
    String recipientName;

    String recipientPhone;

    @Column(nullable = false)
    String province;

    @Column(nullable = false)
    String ward;

    String detailAddress;

}
