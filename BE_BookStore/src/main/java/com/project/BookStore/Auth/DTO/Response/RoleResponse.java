package com.project.BookStore.Auth.DTO.Response;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleResponse{
    Long id;
    String name;
    String description;
    Set<String> permissions;
}
