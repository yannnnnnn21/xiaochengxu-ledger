package com.warmledger.backend.statistics.dto;

import java.math.BigDecimal;

public class CategoryStatItem {

    private String category;
    private String icon;
    private String tone;
    private String color;
    private BigDecimal amount;
    private BigDecimal value;
    private BigDecimal percent;
    private String amountText;
    private String valueText;

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public String getTone() {
        return tone;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getValue() {
        return value;
    }

    public void setValue(BigDecimal value) {
        this.value = value;
    }

    public BigDecimal getPercent() {
        return percent;
    }

    public void setPercent(BigDecimal percent) {
        this.percent = percent;
    }

    public String getAmountText() {
        return amountText;
    }

    public void setAmountText(String amountText) {
        this.amountText = amountText;
    }

    public String getValueText() {
        return valueText;
    }

    public void setValueText(String valueText) {
        this.valueText = valueText;
    }
}

