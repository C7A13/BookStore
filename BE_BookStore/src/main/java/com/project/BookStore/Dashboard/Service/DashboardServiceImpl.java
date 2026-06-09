package com.project.BookStore.Dashboard.Service;

import com.project.BookStore.Dashboard.DTO.Response.DashboardResponse;
import com.project.BookStore.Dashboard.Repository.DashboardRepository;
import com.project.BookStore.Order.Enum.OrderStatus;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashboardServiceImpl implements DashboardService {

    private static final BigDecimal ONE_MILLION = BigDecimal.valueOf(1_000_000);

    DashboardRepository dashboardRepository;

    @Override
    public DashboardResponse getDashboard() {
        int currentYear = LocalDate.now().getYear();
        int currentMonth = LocalDate.now().getMonthValue();

        return DashboardResponse.builder()
                .stats(getStats())
                .bookByMonth(getBookByMonth(currentYear))
                .orderByMonth(getOrderByMonth(currentYear))
                .revenueData(getRevenueData(currentYear, currentMonth))
                .orderStatusData(getOrderStatusData())
                .topSellingBooks(getTopSellingBooks())
                .lowStockBooks(getLowStockBooks())
                .hotCategories(getHotCategories())
                .build();
    }

    private DashboardResponse.Stats getStats() {
        Long totalBooks = dashboardRepository.countTotalBooks();
        Long activeBooks = dashboardRepository.countActiveBooks();
        Long totalOrders = dashboardRepository.countTotalOrders();
        Long totalUsers = dashboardRepository.countTotalUsers();
        BigDecimal totalRevenue = dashboardRepository.sumDeliveredRevenue();
        if (totalRevenue == null) {
            totalRevenue = BigDecimal.ZERO;
        }

        return DashboardResponse.Stats.builder()
                .totalBooks(totalBooks)
                .activeBooks(activeBooks)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .totalUsers(totalUsers)
                .build();
    }

    private List<DashboardResponse.MonthlyCount> getBookByMonth(int year) {
        Map<Integer, Long> data = toMonthlyCountMap(dashboardRepository.countBooksByMonth(year));

        return buildFullYearMonthlyCounts(data);
    }

    private List<DashboardResponse.MonthlyCount> getOrderByMonth(int year) {
        Map<Integer, Long> data = toMonthlyCountMap(dashboardRepository.countOrdersByMonth(year));

        return buildFullYearMonthlyCounts(data);
    }

    private List<DashboardResponse.RevenueItem> getRevenueData(int currentYear, int currentMonth) {
        Map<Integer, BigDecimal> currentYearRevenue = toMonthlyRevenueMap(dashboardRepository.sumDeliveredRevenueByMonth(currentYear));
        Map<Integer, BigDecimal> lastYearRevenue = toMonthlyRevenueMap(dashboardRepository.sumDeliveredRevenueByMonth(currentYear - 1));
        List<DashboardResponse.RevenueItem> items = new ArrayList<>();

        for (int month = 1; month <= currentMonth; month++) {
            items.add(DashboardResponse.RevenueItem.builder()
                    .month(formatMonth(month))
                    .revenue(toMillion(currentYearRevenue.getOrDefault(month, BigDecimal.ZERO)))
                    .last(toMillion(lastYearRevenue.getOrDefault(month, BigDecimal.ZERO)))
                    .build());
        }

        return items;
    }

    private List<DashboardResponse.OrderStatusItem> getOrderStatusData() {
        Map<OrderStatus, Long> statusCounts = new EnumMap<>(OrderStatus.class);
        List<Object[]> rows = dashboardRepository.countOrdersByStatus();

        for (Object[] row : rows) {
            statusCounts.put((OrderStatus) row[0], (Long) row[1]);
        }

        List<DashboardResponse.OrderStatusItem> items = new ArrayList<>();
        items.add(orderStatusItem("Chờ xác nhận", statusCounts.getOrDefault(OrderStatus.PENDING, 0L)));
        items.add(orderStatusItem("Đang giao", sum(statusCounts, OrderStatus.CONFIRMED, OrderStatus.PACKING, OrderStatus.SHIPPED)));
        items.add(orderStatusItem("Đã giao", statusCounts.getOrDefault(OrderStatus.DELIVERED, 0L)));
        items.add(orderStatusItem("Đã huỷ", statusCounts.getOrDefault(OrderStatus.CANCELLED, 0L)));
        items.add(orderStatusItem("Hoàn tiền", statusCounts.getOrDefault(OrderStatus.REFUNDED, 0L)));
        return items;
    }

    private List<DashboardResponse.TopSellingBookItem> getTopSellingBooks() {
        List<Object[]> rows = dashboardRepository.findTopSellingBooks(5);

        List<DashboardResponse.TopSellingBookItem> items = new ArrayList<>();
        for (int i = 0; i < rows.size(); i++) {
            Object[] row = rows.get(i);
            Long bookId = (Long) row[0];
            String title = (String) row[1];
            Long sold = (Long) row[2];

            items.add(DashboardResponse.TopSellingBookItem.builder()
                    .name(title)
                    .author(getFirstAuthorName(bookId))
                    .sold(sold)
                    .build());
        }

        return items;
    }

    private List<DashboardResponse.LowStockBookItem> getLowStockBooks() {
        List<Object[]> rows = dashboardRepository.findLowStockBooks(5);

        return rows.stream()
                .map(row -> DashboardResponse.LowStockBookItem.builder()
                        .name((String) row[0])
                        .stock((Integer) row[1])
                        .build())
                .toList();
    }

    private List<DashboardResponse.HotCategoryItem> getHotCategories() {
        List<Object[]> rows = dashboardRepository.findHotCategories(5);

        return rows.stream()
                .map(row -> DashboardResponse.HotCategoryItem.builder()
                        .name((String) row[0])
                        .count((Long) row[1])
                        .build())
                .toList();
    }

    private Map<Integer, Long> toMonthlyCountMap(List<Object[]> rows) {
        Map<Integer, Long> data = new LinkedHashMap<>();
        for (Object[] row : rows) {
            data.put((Integer) row[0], (Long) row[1]);
        }
        return data;
    }

    private Map<Integer, BigDecimal> toMonthlyRevenueMap(List<Object[]> rows) {
        Map<Integer, BigDecimal> data = new LinkedHashMap<>();
        for (Object[] row : rows) {
            data.put((Integer) row[0], (BigDecimal) row[1]);
        }
        return data;
    }

    private List<DashboardResponse.MonthlyCount> buildFullYearMonthlyCounts(Map<Integer, Long> data) {
        List<DashboardResponse.MonthlyCount> items = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            items.add(DashboardResponse.MonthlyCount.builder()
                    .month(formatMonth(month))
                    .count(data.getOrDefault(month, 0L))
                    .build());
        }
        return items;
    }

    private String getFirstAuthorName(Long bookId) {
        String authorName = dashboardRepository.findFirstAuthorName(bookId);
        return authorName == null ? "Không rõ" : authorName;
    }

    private DashboardResponse.OrderStatusItem orderStatusItem(String name, long value) {
        return DashboardResponse.OrderStatusItem.builder()
                .name(name)
                .value(value)
                .build();
    }

    private long sum(Map<OrderStatus, Long> counts, OrderStatus... statuses) {
        long total = 0;
        for (OrderStatus status : statuses) {
            total += counts.getOrDefault(status, 0L);
        }
        return total;
    }

    private BigDecimal toMillion(BigDecimal value) {
        return value.divide(ONE_MILLION, 2, RoundingMode.HALF_UP).stripTrailingZeros();
    }

    private String formatMonth(int month) {
        return "Th" + month;
    }

}
