-- =====================================================================
-- 005 UP: Bảng cấu hình hệ thống cho trang admin Settings
--
-- LÝ DO: cấu hình nền tảng (tên, logo) và tham số AI Engine đang nằm trong
--   mock của frontend, chưa có nơi lưu thật.
--
-- MÔ HÌNH 1 DÒNG: toàn hệ thống chỉ có đúng 1 bản cấu hình. Ràng buộc bằng
--   unique index trên hằng số true (singleton) để không ai chèn được dòng thứ 2 —
--   nếu để tự do, backend sẽ phải đoán "dòng nào mới là cấu hình thật".
--
-- GHI CHÚ: phần "Quản lý tài khoản" của trang Settings (họ tên, email, múi giờ,
--   thời gian phiên) KHÔNG thuộc bảng này — nó nằm ở app_user của admin đang
--   đăng nhập (xem migration 004).
-- =====================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS platform_setting (
    setting_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    platform_name    VARCHAR(150) NOT NULL DEFAULT 'Amazing Tech — Template Studio',
    logo_url         TEXT,

    -- Nhóm AI Engine
    ai_enabled          BOOLEAN     NOT NULL DEFAULT true,
    ai_daily_limit      INT         NOT NULL DEFAULT 2500,
    ai_default_model    VARCHAR(50) NOT NULL DEFAULT 'amazing-ui-v2.0',
    ai_concurrent_limit INT         NOT NULL DEFAULT 100,

    updated_by  UUID REFERENCES app_user(user_id) ON DELETE SET NULL,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Cột hằng phục vụ ràng buộc singleton bên dưới.
    is_singleton BOOLEAN NOT NULL DEFAULT true CHECK (is_singleton)
);

-- Chỉ tồn tại đúng 1 dòng cấu hình cho toàn hệ thống.
CREATE UNIQUE INDEX IF NOT EXISTS uq_platform_setting_singleton
    ON platform_setting (is_singleton);

-- Khởi tạo sẵn dòng cấu hình mặc định (chạy lại migration không tạo thêm dòng).
INSERT INTO platform_setting DEFAULT VALUES
ON CONFLICT DO NOTHING;

-- DROP trước để chạy lại migration không lỗi "trigger already exists".
DROP TRIGGER IF EXISTS trg_platform_setting_updated ON platform_setting;
CREATE TRIGGER trg_platform_setting_updated BEFORE UPDATE ON platform_setting
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
