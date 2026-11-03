package com.warmledger.backend.statistics.controller;

import com.warmledger.backend.common.ApiResponse;
import com.warmledger.backend.statistics.dto.CategoryStatisticsVO;
import com.warmledger.backend.statistics.dto.MonthlyStatisticsVO;
import com.warmledger.backend.statistics.dto.OverviewVO;
import com.warmledger.backend.statistics.service.StatisticsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    @GetMapping("/monthly")
    public ApiResponse<MonthlyStatisticsVO> monthly(
            @RequestParam(required = false) String month) {
        return ApiResponse.success(statisticsService.monthly(month));
    }

    @GetMapping("/categories")
    public ApiResponse<CategoryStatisticsVO> categories(
            @RequestParam(required = false) String month,
            @RequestParam(defaultValue = "expense") String type) {
        return ApiResponse.success(statisticsService.categories(month, type));
    }

    @GetMapping("/overview")
    public ApiResponse<OverviewVO> overview(
            @RequestParam(required = false) String month) {
        return ApiResponse.success(statisticsService.overview(month));
    }
}

