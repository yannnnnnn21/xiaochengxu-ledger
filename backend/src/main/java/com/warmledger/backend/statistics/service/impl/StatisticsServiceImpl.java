package com.warmledger.backend.statistics.service.impl;

import com.warmledger.backend.bill.dto.BillVO;
import com.warmledger.backend.bill.service.BillService;
import com.warmledger.backend.bill.service.impl.BillServiceImpl;
import com.warmledger.backend.common.CategoryCatalog;
import com.warmledger.backend.statistics.dto.CategoryStatItem;
import com.warmledger.backend.statistics.dto.CategoryStatRow;
import com.warmledger.backend.statistics.dto.CategoryStatisticsVO;
import com.warmledger.backend.statistics.dto.MonthlyStatisticsVO;
import com.warmledger.backend.statistics.dto.MonthlySummaryRow;
import com.warmledger.backend.statistics.dto.OverviewVO;
import com.warmledger.backend.statistics.mapper.StatisticsMapper;
import com.warmledger.backend.statistics.service.StatisticsService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@Service
public class StatisticsServiceImpl implements StatisticsService {

    private final StatisticsMapper statisticsMapper;
    private final BillService billService;

    public StatisticsServiceImpl(StatisticsMapper statisticsMapper, BillService billService) {
        this.statisticsMapper = statisticsMapper;
        this.billService = billService;
    }

    @Override
    public MonthlyStatisticsVO monthly(String month) {
        YearMonth yearMonth = BillServiceImpl.parseMonth(month);
        MonthlySummaryRow row = statisticsMapper.selectMonthlySummary(
                yearMonth.atDay(1),
                yearMonth.plusMonths(1).atDay(1)
        );

        BigDecimal income = safeAmount(row == null ? null : row.getIncomeAmount());
        BigDecimal expense = safeAmount(row == null ? null : row.getExpenseAmount());
        BigDecimal balance = income.subtract(expense).setScale(2, RoundingMode.HALF_UP);

        MonthlyStatisticsVO result = new MonthlyStatisticsVO();
        result.setMonth(yearMonth.toString());
        result.setIncomeAmount(income);
        result.setExpenseAmount(expense);
        result.setBalanceAmount(balance);
        result.setBillCount(row == null || row.getBillCount() == null ? 0 : row.getBillCount());
        result.setIncomeText(BillServiceImpl.moneyText(income));
        result.setExpenseText(BillServiceImpl.moneyText(expense));
        result.setBalanceText(BillServiceImpl.moneyText(balance));
        return result;
    }

    @Override
    public CategoryStatisticsVO categories(String month, String type) {
        YearMonth yearMonth = BillServiceImpl.parseMonth(month);
        String actualType = type == null || type.trim().isEmpty()
                ? CategoryCatalog.EXPENSE
                : type;
        BillServiceImpl.validateType(actualType);

        List<CategoryStatRow> rows = statisticsMapper.selectCategoryStatistics(
                actualType,
                yearMonth.atDay(1),
                yearMonth.plusMonths(1).atDay(1)
        );

        BigDecimal total = BigDecimal.ZERO;
        for (CategoryStatRow row : rows) {
            total = total.add(safeRawAmount(row.getAmount()));
        }

        List<CategoryStatItem> items = new ArrayList<>();
        BigDecimal assignedPercent = BigDecimal.ZERO;
        for (int index = 0; index < rows.size(); index++) {
            CategoryStatRow row = rows.get(index);
            CategoryCatalog.CategoryMeta meta =
                    CategoryCatalog.get(row.getCategory(), actualType);
            BigDecimal amount = safeAmount(row.getAmount());
            BigDecimal percent;

            if (index == rows.size() - 1) {
                percent = new BigDecimal("100").subtract(assignedPercent);
            } else if (total.compareTo(BigDecimal.ZERO) == 0) {
                percent = BigDecimal.ZERO;
            } else {
                percent = amount.multiply(new BigDecimal("100"))
                        .divide(total, 2, RoundingMode.HALF_UP);
            }
            assignedPercent = assignedPercent.add(percent);

            CategoryStatItem item = new CategoryStatItem();
            item.setCategory(row.getCategory());
            item.setIcon(meta.getIcon());
            item.setTone(meta.getTone());
            item.setColor(meta.getColor());
            item.setAmount(amount);
            item.setValue(amount);
            item.setPercent(percent);
            item.setAmountText(BillServiceImpl.moneyText(amount));
            item.setValueText(BillServiceImpl.moneyText(amount));
            items.add(item);
        }

        CategoryStatisticsVO result = new CategoryStatisticsVO();
        result.setMonth(yearMonth.toString());
        result.setType(actualType);
        result.setTotalAmount(total.setScale(2, RoundingMode.HALF_UP));
        result.setTotalText(BillServiceImpl.moneyText(total));
        result.setItems(items);
        return result;
    }

    @Override
    public OverviewVO overview(String month) {
        String actualMonth = month == null || month.trim().isEmpty()
                ? YearMonth.now().toString()
                : BillServiceImpl.parseMonth(month).toString();
        List<BillVO> recentBills = billService
                .list(actualMonth, null, null, 1, 5)
                .getRecords();

        OverviewVO result = new OverviewVO();
        result.setMonthly(monthly(actualMonth));
        result.setCategories(categories(actualMonth, CategoryCatalog.EXPENSE));
        result.setRecentBills(recentBills);
        return result;
    }

    private BigDecimal safeAmount(BigDecimal amount) {
        return safeRawAmount(amount).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal safeRawAmount(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }
}

