package com.project.BookStore.Common.Response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Setter
@Getter
@Builder
public class PageResponse<T> {
    private List<T> data;
    private int page;
    private int size;
    private long total;
    private int totalPages;
}
