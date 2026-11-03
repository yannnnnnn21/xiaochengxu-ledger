package com.warmledger.backend.bill.service;

import com.warmledger.backend.bill.dto.BillRequest;
import com.warmledger.backend.bill.dto.BillVO;
import com.warmledger.backend.common.PageResult;

public interface BillService {

    BillVO create(BillRequest request);

    BillVO getById(Long id);

    PageResult<BillVO> list(
            String month,
            String type,
            String category,
            long page,
            long size
    );

    BillVO update(Long id, BillRequest request);

    void delete(Long id);
}

