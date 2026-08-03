-- =====================================================================
-- 004 DOWN: Gỡ các field quản trị khỏi app_user (rollback của 004 UP)
--
-- LƯU Ý: rollback XOÁ DỮ LIỆU — số điện thoại, trạng thái khoá tài khoản,
--   múi giờ và thời gian phiên đã lưu sẽ mất hẳn.
--   Tài khoản đang bị khoá (is_active = false) sau khi rollback sẽ đăng nhập lại được.
-- =====================================================================

BEGIN;

DROP INDEX IF EXISTS idx_user_is_active;

ALTER TABLE app_user
    DROP COLUMN IF EXISTS phone,
    DROP COLUMN IF EXISTS is_active,
    DROP COLUMN IF EXISTS timezone,
    DROP COLUMN IF EXISTS session_timeout;

COMMIT;
