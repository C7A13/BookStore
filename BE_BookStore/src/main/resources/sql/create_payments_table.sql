-- ============================================================
-- Table: payments
-- Lưu thông tin thanh toán cho từng đơn hàng
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id                    BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id              BIGINT        NOT NULL UNIQUE COMMENT 'Mỗi đơn hàng chỉ có 1 bản ghi payment chính',
    payment_method        VARCHAR(20)   NOT NULL COMMENT 'COD | VNPAY | BANK_TRANSFER',
    status                VARCHAR(20)   NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING | SUCCESS | FAILED | REFUNDED',
    amount                DECIMAL(15,0) NOT NULL COMMENT 'Số tiền (VNĐ)',

    -- VNPay specific columns
    vnpay_txn_ref         VARCHAR(100)  NULL COMMENT 'Mã giao dịch gửi lên VNPay',
    vnpay_transaction_no  VARCHAR(100)  NULL COMMENT 'Mã giao dịch VNPay trả về',
    vnpay_bank_code       VARCHAR(20)   NULL,
    vnpay_order_info      VARCHAR(255)  NULL,
    vnpay_pay_date        VARCHAR(20)   NULL,
    vnpay_response_code   VARCHAR(10)   NULL,

    paid_at               DATETIME      NULL,
    note                  TEXT          NULL,

    -- Audit
    created_at            DATETIME      NOT NULL,
    updated_at            DATETIME      NOT NULL,
    deleted_at            DATETIME      NULL,

    CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index tìm kiếm theo txn ref
CREATE INDEX idx_payments_vnpay_txn_ref ON payments(vnpay_txn_ref);
