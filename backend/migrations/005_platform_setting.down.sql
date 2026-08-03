-- =====================================================================
-- 005 DOWN: Gỡ bảng cấu hình hệ thống (rollback của 005 UP)
--
-- LƯU Ý: rollback XOÁ DỮ LIỆU — tên nền tảng, logo và toàn bộ tham số
--   AI Engine đã cấu hình sẽ mất; chạy lại 005 UP chỉ khôi phục giá trị mặc định.
-- =====================================================================

BEGIN;

DROP TRIGGER IF EXISTS trg_platform_setting_updated ON platform_setting;
DROP TABLE IF EXISTS platform_setting;

COMMIT;
