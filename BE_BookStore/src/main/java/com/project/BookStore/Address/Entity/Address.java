package com.project.BookStore.Address.Entity;

import com.project.BookStore.Common.Entity.BaseEntity;
import com.project.BookStore.User.Entity.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "addresses")
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class Address extends BaseEntity {

    @Column(name = "recipient_name", nullable = false)
    String recipientName;

    @Column(name = "recipient_phone", nullable = false)
    String recipientPhone;

    @Column(nullable = false)
    String province;

    @Column(nullable = false)
    String ward;

    @Column(name = "detail_address", nullable = false)
    String detailAddress;

    @Builder.Default
    @Column(nullable = false)
    Boolean isDefault = false;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

}
