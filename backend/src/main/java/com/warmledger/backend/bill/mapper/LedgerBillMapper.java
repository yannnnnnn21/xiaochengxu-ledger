package com.warmledger.backend.bill.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.warmledger.backend.bill.entity.LedgerBill;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;

public interface LedgerBillMapper extends BaseMapper<LedgerBill> {

    IPage<LedgerBill> selectBillsPage(
            IPage<LedgerBill> page,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("type") String type,
            @Param("category") String category
    );
}

