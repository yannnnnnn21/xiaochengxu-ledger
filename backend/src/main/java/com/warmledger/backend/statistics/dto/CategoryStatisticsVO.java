package com.warmledger.backend.statistics.dto;

import java.math.BigDecimal;
import java.util.List;

public class CategoryStatisticsVO {

    private String month;
    private String type;
    private BigDecimal totalAmount;
    private String totalText;
    private List<CategoryStatItem> items;

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getTotalText() {
        return totalText;
    }

    public void setTotalText(String totalText) {
        this.totalText = totalText;
    }

    public List<CategoryStatItem> getItems() {
        return items;
    }

    public void setItems(List<CategoryStatItem> items) {
        this.items = items;
    }
}

