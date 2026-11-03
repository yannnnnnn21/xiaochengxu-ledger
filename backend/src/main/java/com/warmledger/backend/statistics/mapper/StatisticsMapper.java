package com.warmledger.backend.statistics.mapper;

import com.warmledger.backend.statistics.dto.CategoryStatRow;
import com.warmledger.backend.statistics.dto.MonthlySummaryRow;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

public interface StatisticsMapper {

    MonthlySummaryRow selectMonthlySummary(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    List<CategoryStatRow> selectCategoryStatistics(
            @Param("type") String type,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}

