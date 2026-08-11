-- =====================================================================
-- 003 DOWN: Gỡ các field quản trị khỏi bảng template (rollback của 003 UP)
--
-- LƯU Ý: rollback XOÁ DỮ LIỆU — toàn bộ category / status / tier /
--   thumbnail_url đã nhập sẽ mất và không khôi phục lại được.
-- =====================================================================

BEGIN;

DROP TRIGGER IF EXISTS trg_template_updated ON template;

DROP INDEX IF EXISTS idx_template_category;
DROP INDEX IF EXISTS idx_template_status;

ALTER TABLE template
    DROP COLUMN IF EXISTS category,
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS tier,
    DROP COLUMN IF EXISTS thumbnail_url,
    DROP COLUMN IF EXISTS updated_at;

-- Chỉ xoá được ENUM sau khi không còn cột nào tham chiếu tới.
DROP TYPE IF EXISTS template_tier;
DROP TYPE IF EXISTS template_status;

COMMIT;
