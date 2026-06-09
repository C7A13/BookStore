CREATE TABLE IF NOT EXISTS inventory_logs (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    book_id      INT UNSIGNED NOT NULL,
    change_qty   INT          NOT NULL,
    type         VARCHAR(30)  NOT NULL,
    reference_id BIGINT UNSIGNED DEFAULT NULL,
    note         TEXT,
    created_by   INT UNSIGNED DEFAULT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_inventory_book (book_id, created_at DESC),
    FOREIGN KEY (book_id)    REFERENCES books(id),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
