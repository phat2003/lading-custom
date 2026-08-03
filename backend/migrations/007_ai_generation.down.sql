-- =====================================================================
-- 007 DOWN: Gỡ bảng AI (rollback của 007 UP)
--
-- LƯU Ý: rollback XOÁ DỮ LIỆU — toàn bộ lịch sử tạo bằng AI và hạn mức
--   đã dùng của mọi user sẽ mất, không khôi phục được.
--   Template đã sinh ra từ AI KHÔNG bị xoá (nằm ở bảng template).
-- =====================================================================

BEGIN;

DROP TABLE IF EXISTS ai_credit;
DROP TABLE IF EXISTS ai_generation;

-- Chỉ xoá được ENUM sau khi bảng tham chiếu nó đã bị xoá.
DROP TYPE IF EXISTS ai_generation_status;

COMMIT;
