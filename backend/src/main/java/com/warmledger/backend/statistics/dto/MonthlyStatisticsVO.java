package com.warmledger.backend.statistics.dto;

import java.math.BigDecimal;

public class MonthlyStatisticsVO {

    private String month;
    private BigDecimal incomeAmount;
    private BigDecimal expenseAmount;
    private BigDecimal balanceAmount;
    private long billCount;
    private String incomeText;
    private String expenseText;
    private String balanceText;

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

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

    public BigDecimal getBalanceAmount() {
        return balanceAmount;
    }

    public void setBalanceAmount(BigDecimal balanceAmount) {
        this.balanceAmount = balanceAmount;
    }

    public long getBillCount() {
        return billCount;
    }

    public void setBillCount(long billCount) {
        this.billCount = billCount;
    }

    public String getIncomeText() {
        return incomeText;
    }

    public void setIncomeText(String incomeText) {
        this.incomeText = incomeText;
    }

    public String getExpenseText() {
        return expenseText;
    }

    public void setExpenseText(String expenseText) {
        this.expenseText = expenseText;
    }

    public String getBalanceText() {
        return balanceText;
    }

    public void setBalanceText(String balanceText) {
        this.balanceText = balanceText;
    }
}

