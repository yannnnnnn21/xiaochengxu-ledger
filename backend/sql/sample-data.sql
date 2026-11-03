USE warm_ledger;

INSERT INTO ledger_bill
    (bill_type, category, amount, transaction_date, transaction_time, note)
VALUES
    ('expense', '餐饮', 86.00, CURDATE(), '18:36:00', '和室友一起吃火锅'),
    ('income', '兼职', 320.00, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '21:10:00', '周末咖啡店兼职'),
    ('expense', '学习', 45.80, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '15:24:00', '专业课教材'),
    ('expense', '交通', 20.00, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '09:12:00', '公交卡充值'),
    ('expense', '娱乐', 39.00, DATE_SUB(CURDATE(), INTERVAL 4 DAY), '20:05:00', '周末看电影');

