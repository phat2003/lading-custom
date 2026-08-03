-- =====================================================================
-- 006 UP: Bảng gói dịch vụ cho trang admin Pricing Plans
--
-- LÝ DO: ENUM plan_type ('free','pro') chỉ nói được user đang ở gói nào,
--   không lưu được giá, tính năng, thứ tự hiển thị, nhãn "Phổ biến nhất"...
--   Trang Pricing Plans vì thế đang chạy hoàn toàn bằng mock.
--
-- QUAN HỆ VỚI ENUM plan_type:
--   pricing_plan.code là VARCHAR, ĐỘC LẬP với ENUM. Bảng này là "bảng giá để
--   hiển thị"; còn việc user thực sự thuộc gói nào vẫn do app_user.plan_type
--   (ENUM) quyết định. Muốn bán thêm gói mới (vd 'enterprise') mà gán được cho
--   user thì phải chạy ALTER TYPE plan_type ADD VALUE — CHƯA làm ở đây vì
--   Postgres không có lệnh xoá giá trị ENUM, thêm vào là không rút lại được.
-- =====================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS pricing_plan (
    plan_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code         VARCHAR(30)  NOT NULL UNIQUE,          -- 'free' | 'pro' | ...
    name         VARCHAR(100) NOT NULL,                 -- 'Miễn phí' | 'Pro'
    label        VARCHAR(100),                          -- nhãn phụ: 'Cơ bản' | 'Doanh nghiệp'
    price        BIGINT       NOT NULL DEFAULT 0,       -- VNĐ, số nguyên (299000)
    unit         VARCHAR(20)  NOT NULL DEFAULT '/tháng',
    highlighted  BOOLEAN      NOT NULL DEFAULT false,   -- gói nổi bật giữa trang
    badge        VARCHAR(50),                           -- 'Phổ biến nhất'
    sort_order   INT          NOT NULL DEFAULT 0,
    is_active    BOOLEAN      NOT NULL DEFAULT true,    -- false = ẩn khỏi bảng giá
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS plan_feature (
    feature_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id     UUID NOT NULL REFERENCES pricing_plan(plan_id) ON DELETE CASCADE,
    label       VARCHAR(200) NOT NULL,                  -- '3 Dự án hoạt động'
    included    BOOLEAN NOT NULL DEFAULT true,          -- ✓ hay ✕
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_plan_feature_plan ON plan_feature (plan_id);

DROP TRIGGER IF EXISTS trg_pricing_plan_updated ON pricing_plan;
CREATE TRIGGER trg_pricing_plan_updated BEFORE UPDATE ON pricing_plan
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- Seed 2 gói đang có thật, khớp nội dung frontend đang hiển thị.
-- ON CONFLICT theo code -> chạy lại migration không tạo trùng.
-- ---------------------------------------------------------------------
INSERT INTO pricing_plan (code, name, label, price, unit, highlighted, badge, sort_order)
VALUES
    ('free', 'Miễn phí', 'Cơ bản',      0,      '/tháng', false, NULL,             1),
    ('pro',  'Pro',      'Doanh nghiệp', 299000, '/tháng', true,  'Phổ biến nhất', 2)
ON CONFLICT (code) DO NOTHING;

-- Tính năng của từng gói. Chỉ seed cho gói CHƯA có dòng tính năng nào,
-- để lần chạy sau không nhân đôi danh sách.
INSERT INTO plan_feature (plan_id, label, included, sort_order)
SELECT p.plan_id, f.label, f.included, f.sort_order
FROM pricing_plan p
JOIN (VALUES
    ('free', '3 Dự án hoạt động',                                  true,  1),
    ('free', 'Thành phần tiêu chuẩn',                              true,  2),
    ('free', 'Hỗ trợ cộng đồng',                                   true,  3),
    ('free', 'Tùy chỉnh Số mẫu',                                   false, 4),
    ('free', 'Quyền truy cập AI Generator',                        false, 5),
    ('pro',  'Không giới hạn số lượng Project',                    true,  1),
    ('pro',  'Gắn Pixel',                                          true,  2),
    ('pro',  'Seo và Social',                                      true,  3),
    ('pro',  'Mở khóa Premium Template',                           true,  4),
    ('pro',  'Xuất bản tĩnh (Static export - HTML/CSS/JS)',        true,  5),
    ('pro',  'Thương hiệu riêng (Custom Branding)',                true,  6),
    ('pro',  'Xóa hoàn toàn Watermark hệ thống',                   true,  7)
) AS f(code, label, included, sort_order) ON f.code = p.code
WHERE NOT EXISTS (
    SELECT 1 FROM plan_feature pf WHERE pf.plan_id = p.plan_id
);

COMMIT;
