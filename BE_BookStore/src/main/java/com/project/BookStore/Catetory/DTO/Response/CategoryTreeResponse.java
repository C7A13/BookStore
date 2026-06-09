package com.project.BookStore.Catetory.DTO.Response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CategoryTreeResponse {

    private Long id;

    private String name;

    private List<CategoryTreeResponse> children;

    private Integer level;
}