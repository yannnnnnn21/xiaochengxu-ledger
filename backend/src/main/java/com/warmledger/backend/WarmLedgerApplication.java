package com.warmledger.backend;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@MapperScan({
        "com.warmledger.backend.bill.mapper",
        "com.warmledger.backend.statistics.mapper"
})
@SpringBootApplication
public class WarmLedgerApplication {

    public static void main(String[] args) {
        SpringApplication.run(WarmLedgerApplication.class, args);
    }
}

