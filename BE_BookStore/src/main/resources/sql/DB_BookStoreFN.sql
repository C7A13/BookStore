-- ================================================================
--  BOOKSTORE DATABASE SCHEMA (MySQL 8.0+)
--  27 bảng · 10 nhóm nghiệp vụ
--  Đầy đủ: OAuth, Email/Phone verification, Soft delete,
--           Timestamps chuẩn, RBAC, addresses → users
-- ================================================================

CREATE DATABASE IF NOT EXISTS db_bookstore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE db_bookstore;


-- ================================================================
-- MODULE 1: USERS & XÁC THỰC
-- ================================================================

CREATE TABLE users (
	id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email               VARCHAR(150) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) DEFAULT NULL,
    full_name           VARCHAR(150),
    user_name           VARCHAR(50) UNIQUE,
    phone               VARCHAR(20) UNIQUE,
    dob                 DATE DEFAULT NULL,
    avatar_url          VARCHAR(255) DEFAULT NULL,
    is_email_verified  	TINYINT(1)   NOT NULL DEFAULT 0,
    is_phone_verified  	TINYINT(1)   NOT NULL DEFAULT 0,
	last_login_at 		DATETIME     DEFAULT NULL,
    status              ENUM('ACTIVE', 'INACTIVE', 'BANNED') NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

-- Đăng nhập qua Google / Facebook / Apple
-- CREATE TABLE user_providers (
--     id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
--     user_id     INT UNSIGNED NOT NULL,
--     provider    VARCHAR(30)  NOT NULL,       -- google | facebook | apple
--     provider_id VARCHAR(100) NOT NULL,       -- UID từ provider trả về
--     created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE KEY uq_provider (provider, provider_id),
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- Xác thực email / phone / reset password
-- CREATE TABLE verification_tokens (
--     id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
--     user_id    INT UNSIGNED NOT NULL,
--     type       VARCHAR(20)  NOT NULL,        -- email | phone | reset_password
--     token      VARCHAR(100) NOT NULL UNIQUE, -- link token hoặc OTP 6 số
--     expires_at DATETIME     NOT NULL,        -- hết hạn
--     used_at    DATETIME     DEFAULT NULL,    -- NULL = chưa dùng
--     created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );


-- ================================================================
-- MODULE 2: PHÂN QUYỀN (RBAC)
-- ================================================================

CREATE TABLE roles (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE, -- admin | manager | staff | accountant
    description TEXT
);

CREATE TABLE permissions (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE, 
    description TEXT
);

CREATE TABLE role_permission (
    role_id       BIGINT UNSIGNED NOT NULL,
    permission_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id)       REFERENCES roles(id)       ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE role_user (
    user_id	BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);


-- ================================================================
-- MODULE 3: KHÁCH HÀNG & NHÂN VIÊN
-- ================================================================

CREATE TABLE customers (
    id             INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    user_id        INT UNSIGNED  NOT NULL UNIQUE,
    loyalty_points INT           NOT NULL DEFAULT 0,
    total_spent    DECIMAL(15,0) NOT NULL DEFAULT 0,
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE employee (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       INT UNSIGNED NOT NULL UNIQUE,
    position      VARCHAR(100),
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE addresses (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id        INT UNSIGNED NOT NULL,
    recipient_name VARCHAR(150),
    phone          VARCHAR(20),
    street         VARCHAR(255),
    ward           VARCHAR(100),
    district       VARCHAR(100),
    city           VARCHAR(80),
    is_default     TINYINT(1)   NOT NULL DEFAULT 0,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE categories (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    slug       VARCHAR(120) NOT NULL UNIQUE,
    parent_id  INT UNSIGNED DEFAULT NULL,   
    is_active  TINYINT(1)   NOT NULL DEFAULT 1,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME     DEFAULT NULL,
    deleted_by INT UNSIGNED DEFAULT NULL,
    FOREIGN KEY (parent_id)  REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (deleted_by) REFERENCES users(id)      ON DELETE SET NULL
);

CREATE TABLE publishers (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(150) NOT NULL,
    email      VARCHAR(150),
    phone      VARCHAR(20),
    address    TEXT,
    is_active  TINYINT(1)   NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

CREATE TABLE authors (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name   VARCHAR(150) NOT NULL,
    slug        VARCHAR(170) NOT NULL UNIQUE,
    bio         TEXT,
    nationality VARCHAR(60),
    birth_year  SMALLINT,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
	updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL
);

CREATE TABLE books (
    id             INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    isbn           VARCHAR(20)   UNIQUE,
    title          VARCHAR(300)  NOT NULL,
    slug           VARCHAR(320)  NOT NULL UNIQUE,
    description    TEXT,
    cover_image    VARCHAR(500),
    price          DECIMAL(12,0) NOT NULL,
    cost_price     DECIMAL(12,0) DEFAULT NULL,
    sale_price     DECIMAL(12,0) DEFAULT NULL,  
    sale_from      DATETIME      DEFAULT NULL,
    sale_to        DATETIME      DEFAULT NULL,
    stock_quantity INT           NOT NULL DEFAULT 0,
    reorder_point  INT           NOT NULL DEFAULT 5,
    weight_gram    INT           DEFAULT NULL,
    page_count     SMALLINT      DEFAULT NULL,
    language       CHAR(5)       NOT NULL DEFAULT 'vi',
    year_published SMALLINT      DEFAULT NULL,
    category_id    INT UNSIGNED  DEFAULT NULL,
    publisher_id   INT UNSIGNED  DEFAULT NULL,
    is_active      TINYINT(1)    NOT NULL DEFAULT 1,
    created_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at     DATETIME      DEFAULT NULL,
    FOREIGN KEY (category_id)  REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (publisher_id) REFERENCES publishers(id) ON DELETE SET NULL,
);

CREATE TABLE book_authors (
    book_id   INT UNSIGNED NOT NULL,
    author_id INT UNSIGNED NOT NULL,
    role      VARCHAR(30)  NOT NULL DEFAULT 'author',  -- author | translator | editor
    PRIMARY KEY (book_id, author_id),
    FOREIGN KEY (book_id)   REFERENCES books(id)   ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);

CREATE TABLE book_images (
    id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    book_id    INT UNSIGNED NOT NULL,
    url        VARCHAR(500) NOT NULL,
    alt_text   VARCHAR(200),
    sort_order SMALLINT     NOT NULL DEFAULT 0,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);


-- ================================================================
-- MODULE 5: GIỎ HÀNG
-- ================================================================

CREATE TABLE carts (
    id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       INT UNSIGNED DEFAULT NULL,
    session_token VARCHAR(100) UNIQUE,   -- khách vãng lai chưa đăng nhập
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at    DATETIME DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- cart_items không cần updated_at vì chỉ update quantity
CREATE TABLE cart_items (
    id         INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    cart_id    INT UNSIGNED  NOT NULL,
    book_id    INT UNSIGNED  NOT NULL,
    quantity   INT           NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,0) NOT NULL,   -- snapshot giá lúc thêm vào giỏ
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME DEFAULT NULL,
    UNIQUE KEY uq_cart_book (cart_id, book_id),
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);


-- ================================================================
-- MODULE 6: ĐƠN HÀNG
-- ================================================================

CREATE TABLE orders (
    id              INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(30)   NOT NULL UNIQUE,   -- ORD-20240101-0001
    user_id         INT UNSIGNED  DEFAULT NULL,
    address_id      INT UNSIGNED  DEFAULT NULL,
    subtotal        DECIMAL(15,0) NOT NULL,
    shipping_fee    DECIMAL(12,0) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(12,0) NOT NULL DEFAULT 0,
    total_amount    DECIMAL(15,0) NOT NULL,
    points_earned   INT           NOT NULL DEFAULT 0,
    promotion_code  VARCHAR(50)   DEFAULT NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'pending',
    -- pending | confirmed | packing | shipped | delivered | cancelled | refunded
    source          VARCHAR(20)   NOT NULL DEFAULT 'web',  -- web | mobile | pos
    note            TEXT,
    ordered_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      DATETIME      DEFAULT NULL,
    delivered_at    DATETIME      DEFAULT NULL,
    FOREIGN KEY (user_id)    REFERENCES users(id)     ON DELETE SET NULL,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE SET NULL
);

-- order_items không có updated_at — không bao giờ sửa sau khi tạo
CREATE TABLE order_items (
    id         INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    order_id   INT UNSIGNED  NOT NULL,
    book_id    INT UNSIGNED  DEFAULT NULL,
    quantity   INT           NOT NULL,
    unit_price DECIMAL(12,0) NOT NULL,   -- snapshot giá tại thời điểm mua
    subtotal   DECIMAL(15,0) NOT NULL,
    created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME      DEFAULT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id)  REFERENCES books(id)  ON DELETE SET NULL
);


-- ================================================================
-- MODULE 7: THANH TOÁN & VẬN CHUYỂN
-- ================================================================

-- payments immutable — không có updated_at
CREATE TABLE payments (
    id              BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT UNSIGNED  NOT NULL,
    method          VARCHAR(30)   NOT NULL,
    -- cod | vnpay | momo | zalopay | bank_transfer
    amount          DECIMAL(15,0) NOT NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'pending',
    -- pending | completed | failed | expired
    transaction_ref VARCHAR(150)  DEFAULT NULL,
    paid_at         DATETIME      DEFAULT NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE shipments (
    id            INT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    order_id      INT UNSIGNED  NOT NULL,
    carrier_name  VARCHAR(80)   DEFAULT NULL,
    tracking_code VARCHAR(100)  DEFAULT NULL,
    status        VARCHAR(30)   NOT NULL DEFAULT 'ready_to_pick',
    -- ready_to_pick | picking | delivering | delivered | failed | returned
    shipping_fee  DECIMAL(12,0) NOT NULL DEFAULT 0,
    cod_amount    DECIMAL(12,0) NOT NULL DEFAULT 0,
    shipped_at    DATETIME      DEFAULT NULL,
    delivered_at  DATETIME      DEFAULT NULL,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);


-- ================================================================
-- MODULE 8: KHUYẾN MÃI
-- ================================================================

CREATE TABLE promotions (
    id                 BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    code               VARCHAR(50)   NOT NULL UNIQUE,
    name               VARCHAR(150)  NOT NULL,
    type               VARCHAR(20)   NOT NULL,  -- percent | fixed_amount | free_shipping
    value              DECIMAL(12,2) NOT NULL,
    max_discount       DECIMAL(12,0) DEFAULT NULL,
    min_order_value    DECIMAL(12,0) NOT NULL DEFAULT 0,
    usage_limit        BIGINT           DEFAULT NULL,   -- NULL = không giới hạn
    usage_per_customer BIGINT           NOT NULL DEFAULT 1,
    used_count         BIGINT           NOT NULL DEFAULT 0,
    is_active          TINYINT(1)    NOT NULL DEFAULT 1,
    valid_from         DATETIME      DEFAULT NULL,
    valid_to           DATETIME      DEFAULT NULL,
    created_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at         DATETIME      DEFAULT NULL,
    FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL
);

-- promotion_usages chỉ ghi 1 lần — không có updated_at
CREATE TABLE promotion_usages (
    id              BIGINT UNSIGNED  AUTO_INCREMENT PRIMARY KEY,
    promotion_id    BIGINT UNSIGNED  NOT NULL,
    user_id         BIGINT UNSIGNED  NOT NULL,
    order_id        BIGINT UNSIGNED  NOT NULL,
    discount_amount DECIMAL(12,0) NOT NULL,
    used_at         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_cancelled    TINYINT(1)    NOT NULL DEFAULT 0,
    FOREIGN KEY (promotion_id) REFERENCES promotions(id),
    FOREIGN KEY (user_id)      REFERENCES users(id),
    FOREIGN KEY (order_id)     REFERENCES orders(id)
);


-- ================================================================
-- MODULE 9: ĐÁNH GIÁ & BÌNH LUẬN
-- ================================================================

CREATE TABLE reviews (
    id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    book_id     BIGINT UNSIGNED NOT NULL,
    user_id     BIGINT UNSIGNED NOT NULL,
    order_id    BIGINT UNSIGNED NOT NULL,   -- chỉ review sau khi đã mua thành công
    rating      TINYINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title       VARCHAR(200) DEFAULT NULL,
    body        TEXT,
    is_verified TINYINT(1)   NOT NULL DEFAULT 1,
    is_visible  TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_review (book_id, user_id, order_id),
    FOREIGN KEY (book_id)  REFERENCES books(id),
    FOREIGN KEY (user_id)  REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE comments (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    book_id    BIGINT UNSIGNED NOT NULL,
    user_id    BIGINT UNSIGNED NOT NULL,
    parent_id  BIGINT UNSIGNED DEFAULT NULL,  -- NULL = gốc, có giá trị = reply
    body       TEXT         NOT NULL,
    is_visible TINYINT(1)   NOT NULL DEFAULT 1,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id)   REFERENCES books(id),
    FOREIGN KEY (user_id)   REFERENCES users(id),
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE SET NULL
);


-- ================================================================
-- MODULE 10: TỒN KHO
-- ================================================================

-- inventory_logs là log thuần — không có updated_at
CREATE TABLE inventory_logs (
    id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    book_id      BIGINT UNSIGNED NOT NULL,
    change_qty   INT          NOT NULL,   -- dương = nhập, âm = xuất
    type         VARCHAR(30)  NOT NULL,   -- purchase | sale | return | adjustment | damage
    reference_id BIGINT UNSIGNED DEFAULT NULL,
    note         TEXT,
    created_by   INT UNSIGNED DEFAULT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id)    REFERENCES books(id),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);


-- ================================================================
-- INDEXES
-- ================================================================

-- Users & Auth
CREATE INDEX idx_users_active              ON users(is_active, deleted_at);
CREATE INDEX idx_users_username            ON users(username);
CREATE INDEX idx_user_providers_user       ON user_providers(user_id);
CREATE INDEX idx_verification_tokens_user  ON verification_tokens(user_id, type);
CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_customers_user            ON customers(user_id);
CREATE INDEX idx_employee_user             ON employee(user_id);
CREATE INDEX idx_addresses_user            ON addresses(user_id);

-- Catalog
CREATE INDEX idx_books_category            ON books(category_id);
CREATE INDEX idx_books_publisher           ON books(publisher_id);
CREATE INDEX idx_books_slug                ON books(slug);
CREATE INDEX idx_books_active              ON books(is_active, deleted_at);
CREATE INDEX idx_books_sale                ON books(sale_from, sale_to);
CREATE INDEX idx_categories_parent         ON categories(parent_id);
CREATE INDEX idx_book_images_book          ON book_images(book_id, sort_order);

-- Cart & Orders
CREATE INDEX idx_carts_user                ON carts(user_id);
CREATE INDEX idx_cart_items_cart           ON cart_items(cart_id);
CREATE INDEX idx_orders_user               ON orders(user_id);
CREATE INDEX idx_orders_status             ON orders(status);
CREATE INDEX idx_orders_date               ON orders(ordered_at DESC);
CREATE INDEX idx_order_items_order         ON order_items(order_id);
CREATE INDEX idx_order_items_book          ON order_items(book_id);

-- Payments & Shipments
CREATE INDEX idx_payments_order            ON payments(order_id);
CREATE INDEX idx_payments_status           ON payments(status);
CREATE INDEX idx_shipments_order           ON shipments(order_id);
CREATE INDEX idx_shipments_tracking        ON shipments(tracking_code);

-- Promotions
CREATE INDEX idx_promotions_active         ON promotions(is_active, valid_from, valid_to, deleted_at);
CREATE INDEX idx_promo_usages_user         ON promotion_usages(user_id, promotion_id);

-- Reviews & Comments
CREATE INDEX idx_reviews_book              ON reviews(book_id, is_visible);
CREATE INDEX idx_comments_book             ON comments(book_id, is_visible);
CREATE INDEX idx_comments_parent           ON comments(parent_id);

-- Inventory
CREATE INDEX idx_inventory_book            ON inventory_logs(book_id, created_at DESC);


-- ================================================================
-- SEED DATA
-- ================================================================

INSERT INTO roles (name, description) VALUES
  ('admin',      'Toàn quyền hệ thống'),
  ('manager',    'Quản lý đơn hàng, kho, nhân viên'),
  ('staff',      'Xử lý đơn hàng và kho'),
  ('accountant', 'Xem báo cáo tài chính');

INSERT INTO permissions (code, description) VALUES
  ('books:view',        'Xem danh sách sách'),
  ('books:edit',        'Thêm / sửa sách'),
  ('books:delete',      'Xoá sách'),
  ('orders:view',       'Xem đơn hàng'),
  ('orders:update',     'Cập nhật trạng thái đơn'),
  ('inventory:view',    'Xem tồn kho'),
  ('inventory:adjust',  'Điều chỉnh tồn kho'),
  ('promotions:manage', 'Quản lý khuyến mãi'),
  ('reports:view',      'Xem báo cáo'),
  ('reports:export',    'Xuất báo cáo'),
  ('customers:view',    'Xem khách hàng'),
  ('staff:manage',      'Quản lý nhân viên');

INSERT INTO categories (name, slug, parent_id) VALUES
  ('Văn học',            'van-hoc',            NULL),
  ('Kinh tế',            'kinh-te',            NULL),
  ('Kỹ năng sống',       'ky-nang-song',       NULL),
  ('Thiếu nhi',          'thieu-nhi',          NULL),
  ('Khoa học',           'khoa-hoc',           NULL),
  ('Lịch sử',            'lich-su',            NULL),
  ('Văn học Việt Nam',   'van-hoc-viet-nam',   1),
  ('Văn học nước ngoài', 'van-hoc-nuoc-ngoai', 1);

INSERT INTO promotions (code, name, type, value, min_order_value, usage_limit, usage_per_customer, valid_from, valid_to) VALUES
  ('WELCOME10', 'Chào mừng khách mới',    'percent',       10,      0,   1, 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR)),
  ('FREESHIP',  'Miễn phí vận chuyển',    'free_shipping',  0, 199000, NULL, 1, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
  ('GIAM50K',   'Giảm 50.000đ đơn 300K', 'fixed_amount', 50000, 300000, 500, 1, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY));
