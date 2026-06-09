package com.project.BookStore.Dashboard.Controller;

import com.project.BookStore.Common.Response.ApiResponse;
import com.project.BookStore.Dashboard.DTO.Response.DashboardResponse;
import com.project.BookStore.Dashboard.Service.DashboardService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminDashboardController {

    DashboardService dashboardService;

    @GetMapping
    public ApiResponse<DashboardResponse> getDashboard() {
        return ApiResponse.success(
                dashboardService.getDashboard(),
                "Lấy dữ liệu dashboard thành công"
        );
    }
}
