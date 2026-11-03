package com.warmledger.backend.statistics.dto;

import com.warmledger.backend.bill.dto.BillVO;

import java.util.List;

public class OverviewVO {

    private MonthlyStatisticsVO monthly;
    private CategoryStatisticsVO categories;
    private List<BillVO> recentBills;

    public MonthlyStatisticsVO getMonthly() {
        return monthly;
    }

    public void setMonthly(MonthlyStatisticsVO monthly) {
        this.monthly = monthly;
    }

    public CategoryStatisticsVO getCategories() {
        return categories;
    }

    public void setCategories(CategoryStatisticsVO categories) {
        this.categories = categories;
    }

    public List<BillVO> getRecentBills() {
        return recentBills;
    }

    public void setRecentBills(List<BillVO> recentBills) {
        this.recentBills = recentBills;
    }
}

