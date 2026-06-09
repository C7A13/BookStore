package com.project.BookStore.Auth.DTO.Response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.Data;

@Data
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
public class GoogleUserResponse {
    @JsonProperty("sub")
    private String id;
    private String email;
    private boolean verifiedEmail;
    private String name;
    private String picture;
}