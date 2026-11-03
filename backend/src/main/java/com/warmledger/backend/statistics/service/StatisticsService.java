package com.warmledger.backend.statistics.service;

import com.warmledger.backend.statistics.dto.CategoryStatisticsVO;
import com.warmledger.backend.statistics.dto.MonthlyStatisticsVO;
import com.warmledger.backend.statistics.dto.OverviewVO;

public interface StatisticsService {

    MonthlyStatisticsVO monthly(String month);

    CategoryStatisticsVO categories(String month, String type);

    OverviewVO overview(String month);
}

