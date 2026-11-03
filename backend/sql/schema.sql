CREATE DATABASE IF NOT EXISTS warm_ledger
    DEFAULT CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE warm_ledger;

CREATE TABLE IF NOT EXISTS ledger_bill (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '账单ID',
    bill_type VARCHAR(16) NOT NULL COMMENT '收支类型：income/expense',
    category VARCHAR(32) NOT NULL COMMENT '账单分类',
    amount DECIMAL(12, 2) NOT NULL COMMENT '金额',
    transaction_date DATE NOT NULL COMMENT '账单日期',
    transaction_time TIME NOT NULL COMMENT '账单时间',
    note VARCHAR(200) NOT NULL DEFAULT '' COMMENT '备注',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    deleted TINYINT NOT NULL DEFAULT 0 COMMENT '逻辑删除：0正常，1已删除',
    PRIMARY KEY (id),
    KEY idx_bill_month_type (deleted, transaction_date, bill_type, category),
    CONSTRAINT chk_ledger_bill_type
        CHECK (bill_type IN ('income', 'expense')),
    CONSTRAINT chk_ledger_bill_amount
        CHECK (amount > 0)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='暖萌学生记账本账单表';

