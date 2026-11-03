package com.warmledger.backend.bill.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Digits;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class BillRequest {

    @NotBlank(message = "收支类型不能为空")
    @Pattern(regexp = "expense|income", message = "收支类型只能是 expense 或 income")
    private String type;

    @NotBlank(message = "分类不能为空")
    @Size(max = 32, message = "分类不能超过32个字符")
    private String category;

    @NotNull(message = "金额不能为空")
    @DecimalMin(value = "0.01", message = "金额必须大于0")
    @Digits(integer = 10, fraction = 2, message = "金额最多10位整数和2位小数")
    private BigDecimal amount;

    @NotNull(message = "账单日期不能为空")
    private LocalDate date;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime time;

    @Size(max = 200, message = "备注不能超过200个字符")
    private String note;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getTime() {
        return time;
    }

    public void setTime(LocalTime time) {
        this.time = time;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}

