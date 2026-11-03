package com.warmledger.backend.statistics.dto;

import java.math.BigDecimal;

public class MonthlySummaryRow {

    private BigDecimal incomeAmount;
    private BigDecimal expenseAmount;
    private Long billCount;

    public BigDecimal getIncomeAmount() {
        return incomeAmount;
    }

    public void setIncomeAmount(BigDecimal incomeAmount) {
        this.incomeAmount = incomeAmount;
    }

    public BigDecimal getExpenseAmount() {
        return expenseAmount;
    }

    public void setExpenseAmount(BigDecimal expenseAmount) {
        this.expenseAmount = expenseAmount;
    }

    public Long getBillCount() {
        return billCount;
    }

    public void setBillCount(Long billCount) {
        this.billCount = billCount;
    }
}

