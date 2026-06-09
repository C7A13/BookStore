package com.project.BookStore.Publisher.Controller;

import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Publisher.DTO.Response.PublisherResponse;
import com.project.BookStore.Publisher.Service.PublisherService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/publishers")
@RequiredArgsConstructor
public class PublisherController {

    private final PublisherService publisherService;

    @GetMapping("/public")
    public ApiResponse<List<PublisherResponse>> getActivePublishers() {
        return ApiResponse.success(
                publisherService.getActivePublishers(),
                "Get active publishers successfully"
        );
    }

    @GetMapping("/public/{id}")
    public ApiResponse<PublisherResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(
                publisherService.getById(id),
                "Get publisher successfully"
        );
    }
}
