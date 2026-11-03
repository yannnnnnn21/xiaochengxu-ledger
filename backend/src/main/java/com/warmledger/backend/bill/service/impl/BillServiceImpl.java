package com.warmledger.backend.bill.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.warmledger.backend.bill.dto.BillRequest;
import com.warmledger.backend.bill.dto.BillVO;
import com.warmledger.backend.bill.entity.LedgerBill;
import com.warmledger.backend.bill.mapper.LedgerBillMapper;
import com.warmledger.backend.bill.service.BillService;
import com.warmledger.backend.common.CategoryCatalog;
import com.warmledger.backend.common.PageResult;
import com.warmledger.backend.exception.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillServiceImpl implements BillService {

    private static final DateTimeFormatter MONTH_FORMATTER =
            DateTimeFormatter.ofPattern("uuuu-MM");
    private static final DateTimeFormatter TIME_FORMATTER =
            DateTimeFormatter.ofPattern("HH:mm");

    private final LedgerBillMapper billMapper;

    public BillServiceImpl(LedgerBillMapper billMapper) {
        this.billMapper = billMapper;
    }

    @Override
    @Transactional
    public BillVO create(BillRequest request) {
        validateRequest(request);
        LedgerBill bill = new LedgerBill();
        applyRequest(bill, request);
        billMapper.insert(bill);
        return toVO(bill);
    }

    @Override
    public BillVO getById(Long id) {
        LedgerBill bill = billMapper.selectById(id);
        if (bill == null) {
            throw BusinessException.notFound("账单不存在");
        }
        return toVO(bill);
    }

    @Override
    public PageResult<BillVO> list(
            String month,
            String type,
            String category,
            long page,
            long size) {
        YearMonth yearMonth = parseMonth(month);
        validateType(type);

        Page<LedgerBill> result = (Page<LedgerBill>) billMapper.selectBillsPage(
                new Page<>(page, size),
                yearMonth.atDay(1),
                yearMonth.plusMonths(1).atDay(1),
                StringUtils.hasText(type) ? type : null,
                StringUtils.hasText(category) ? category : null
        );
        List<BillVO> records = result.getRecords()
                .stream()
                .map(BillServiceImpl::toVO)
                .collect(Collectors.toList());

        return new PageResult<>(
                records,
                result.getTotal(),
                result.getCurrent(),
                result.getSize(),
                result.getPages()
        );
    }

    @Override
    @Transactional
    public BillVO update(Long id, BillRequest request) {
        validateRequest(request);
        LedgerBill bill = billMapper.selectById(id);
        if (bill == null) {
            throw BusinessException.notFound("账单不存在");
        }
        applyRequest(bill, request);
        billMapper.updateById(bill);
        return toVO(bill);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        int affectedRows = billMapper.deleteById(id);
        if (affectedRows == 0) {
            throw BusinessException.notFound("账单不存在");
        }
    }

    public static YearMonth parseMonth(String month) {
        if (!StringUtils.hasText(month)) {
            return YearMonth.now();
        }
        try {
            return YearMonth.parse(month, MONTH_FORMATTER);
        } catch (DateTimeParseException exception) {
            throw BusinessException.badRequest("月份格式必须为 yyyy-MM");
        }
    }

    public static void validateType(String type) {
        if (!StringUtils.hasText(type)) {
            return;
        }
        if (!CategoryCatalog.EXPENSE.equals(type) && !CategoryCatalog.INCOME.equals(type)) {
            throw BusinessException.badRequest("收支类型只能是 expense 或 income");
        }
    }

    private void validateRequest(BillRequest request) {
        if (!CategoryCatalog.supports(request.getType(), request.getCategory())) {
            throw BusinessException.badRequest("分类与收支类型不匹配");
        }
    }

    private void applyRequest(LedgerBill bill, BillRequest request) {
        bill.setType(request.getType());
        bill.setCategory(request.getCategory());
        bill.setAmount(request.getAmount().setScale(2, RoundingMode.HALF_UP));
        bill.setDate(request.getDate());
        bill.setTime(request.getTime() == null ? LocalTime.now() : request.getTime());
        bill.setNote(request.getNote() == null ? "" : request.getNote().trim());
    }

    public static BillVO toVO(LedgerBill bill) {
        CategoryCatalog.CategoryMeta meta =
                CategoryCatalog.get(bill.getCategory(), bill.getType());
        BillVO vo = new BillVO();
        vo.setId(bill.getId());
        vo.setType(bill.getType());
        vo.setCategory(bill.getCategory());
        vo.setNote(bill.getNote());
        vo.setAmount(bill.getAmount());
        vo.setAmountText(moneyText(bill.getAmount()));
        vo.setAmountPrefix(CategoryCatalog.INCOME.equals(bill.getType()) ? "+" : "-");
        vo.setDate(bill.getDate().toString());
        vo.setDateText(monthDayText(bill.getDate()));
        vo.setTime(bill.getTime().format(TIME_FORMATTER));
        vo.setTimeText(bill.getTime().format(TIME_FORMATTER));
        vo.setIcon(meta.getIcon());
        vo.setTone(meta.getTone());
        vo.setColor(meta.getColor());
        vo.setCreatedAt(bill.getCreatedAt());
        vo.setUpdatedAt(bill.getUpdatedAt());
        return vo;
    }

    public static String moneyText(BigDecimal amount) {
        BigDecimal value = amount == null ? BigDecimal.ZERO : amount;
        String[] parts = value.setScale(2, RoundingMode.HALF_UP).toPlainString().split("\\.");
        StringBuilder integer = new StringBuilder();
        String source = parts[0];
        for (int index = 0; index < source.length(); index++) {
            if (index > 0 && (source.length() - index) % 3 == 0
                    && source.charAt(index - 1) != '-') {
                integer.append(',');
            }
            integer.append(source.charAt(index));
        }
        return integer.append('.').append(parts[1]).toString();
    }

    private static String monthDayText(LocalDate date) {
        return String.format("%02d月%02d日", date.getMonthValue(), date.getDayOfMonth());
    }
}

