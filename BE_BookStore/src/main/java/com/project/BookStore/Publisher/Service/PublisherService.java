package com.project.BookStore.Publisher.Service;

import com.project.BookStore.Publisher.DTO.Request.PublisherRequest;
import com.project.BookStore.Publisher.DTO.Response.PublisherResponse;

import java.util.List;

public interface PublisherService {

    PublisherResponse create(PublisherRequest request);

    PublisherResponse update(Long id, PublisherRequest request);

    void delete(Long id);

    void restore(Long id);

    void toggleActive(Long id);

    List<PublisherResponse> getAll(Boolean deleted);

    PublisherResponse getById(Long id);

    List<PublisherResponse> getActivePublishers();
}
