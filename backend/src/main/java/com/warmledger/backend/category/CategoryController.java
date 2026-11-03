package com.warmledger.backend.category;

import com.warmledger.backend.bill.service.impl.BillServiceImpl;
import com.warmledger.backend.common.ApiResponse;
import com.warmledger.backend.common.CategoryCatalog;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @GetMapping
    public ApiResponse<List<CategoryCatalog.CategoryMeta>> list(
            @RequestParam(defaultValue = "expense") String type) {
        BillServiceImpl.validateType(type);
        return ApiResponse.success(CategoryCatalog.list(type));
    }
}
