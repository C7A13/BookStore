package com.project.BookStore.Publisher.Controller;

import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Publisher.DTO.Request.PublisherRequest;
import com.project.BookStore.Publisher.DTO.Response.PublisherResponse;
import com.project.BookStore.Publisher.Service.PublisherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/publishers")
@RequiredArgsConstructor
public class AdminPublisherController {

    private final PublisherService publisherService;

    // POST /admin/publishers
    @PostMapping
    public ApiResponse<PublisherResponse> create(@Valid @RequestBody PublisherRequest request) {
        return ApiResponse.success(
                publisherService.create(request),
                "Create publisher successfully"
        );
    }


    @PutMapping("/{id}")
    public ApiResponse<PublisherResponse> update(@PathVariable Long id,
                                                 @Valid @RequestBody PublisherRequest request) {
        return ApiResponse.success(
                publisherService.update(id, request),
                "Update publisher successfully"
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        publisherService.delete(id);
        return ApiResponse.success("Delete publisher successfully");
    }


    @PutMapping("/{id}/restore")
    public ApiResponse<Void> restore(@PathVariable Long id) {
        publisherService.restore(id);
        return ApiResponse.success("Restore publisher successfully");
    }

    @PutMapping("/{id}/toggle-active")
    public ApiResponse<Void> toggleActive(@PathVariable Long id) {
        publisherService.toggleActive(id);
        return ApiResponse.success("Toggle publisher status successfully");
    }

    @GetMapping
    public ApiResponse<List<PublisherResponse>> getAll(
            @RequestParam(required = false) Boolean deleted) {
        return ApiResponse.success(
                publisherService.getAll(deleted),
                "Get all publishers successfully"
        );
    }

    @GetMapping("/{id}")
    public ApiResponse<PublisherResponse> getById(@PathVariable Long id) {
        return ApiResponse.success(
                publisherService.getById(id),
                "Get publisher successfully"
        );
    }
}
