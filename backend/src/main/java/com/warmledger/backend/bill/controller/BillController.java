package com.warmledger.backend.bill.controller;

import com.warmledger.backend.bill.dto.BillRequest;
import com.warmledger.backend.bill.dto.BillVO;
import com.warmledger.backend.bill.service.BillService;
import com.warmledger.backend.common.ApiResponse;
import com.warmledger.backend.common.PageResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.Valid;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.Positive;

@Validated
@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @PostMapping
    public ApiResponse<BillVO> create(@Valid @RequestBody BillRequest request) {
        return ApiResponse.success("记账成功", billService.create(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<BillVO> getById(@PathVariable @Positive Long id) {
        return ApiResponse.success(billService.getById(id));
    }

    @GetMapping
    public ApiResponse<PageResult<BillVO>> list(
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") @Min(1) long page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) long size) {
        return ApiResponse.success(
                billService.list(month, type, category, page, size)
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<BillVO> update(
            @PathVariable @Positive Long id,
            @Valid @RequestBody BillRequest request) {
        return ApiResponse.success("账单已更新", billService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable @Positive Long id) {
        billService.delete(id);
        return ApiResponse.success("账单已删除", null);
    }
}
