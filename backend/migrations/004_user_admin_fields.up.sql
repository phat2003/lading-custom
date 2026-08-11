-- =====================================================================
-- 004 UP: Bổ sung field quản trị cho bảng app_user
--
-- LÝ DO:
--   - Trang admin Users hiển thị cột Contact (số điện thoại) và badge
--     Active/Inactive, nhưng app_user chưa có 2 cột này.
--   - Trang Settings cần múi giờ + thời gian phiên của tài khoản đang đăng nhập.
--
-- CHỐT NGHIỆP VỤ (Phần E câu 1):
--   is_active là công tắc do ADMIN bật/tắt thủ công (khoá tài khoản),
--   KHÔNG phải suy ra từ "lâu không đăng nhập". Vì vậy không thêm last_login_at.
-- =====================================================================

BEGIN;

ALTER TABLE app_user
    -- Nullable: user đăng ký qua /auth/register không nhập số điện thoại.
    ADD COLUMN IF NOT EXISTS phone           VARCHAR(20),
    -- Mặc định true: toàn bộ user đang có vẫn đăng nhập bình thường sau migrate.
    ADD COLUMN IF NOT EXISTS is_active       BOOLEAN     NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS timezone        VARCHAR(64) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    -- never | 30m | 1h | 1d — dạng chuỗi để FE hiển thị thẳng, không phải quy đổi.
    ADD COLUMN IF NOT EXISTS session_timeout VARCHAR(16) NOT NULL DEFAULT 'never';

-- Phục vụ bộ lọc ?status=active|inactive của trang admin Users.
CREATE INDEX IF NOT EXISTS idx_user_is_active ON app_user (is_active);

COMMIT;
