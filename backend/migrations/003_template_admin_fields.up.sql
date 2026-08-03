-- =====================================================================
-- 003 UP: Bổ sung field quản trị cho bảng template
--
-- LÝ DO:
--   Trang admin Templates hiển thị Category / Status / Tier / ảnh thumbnail
--   và thời điểm cập nhật, nhưng bảng template mới chỉ có
--   (template_id, name, type, owner_id, template_source, created_at).
--
--   Số section KHÔNG thêm cột ở đây — đếm trực tiếp từ template_section
--   để không bao giờ lệch với dữ liệu thật.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. ENUM mới. Bọc trong DO ... EXCEPTION vì CREATE TYPE không có
--    IF NOT EXISTS — chạy lại migration sẽ không lỗi.
-- ---------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE template_status AS ENUM ('draft', 'published');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE template_tier AS ENUM ('free', 'premium');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------
-- 2. Thêm cột.
--    category nullable: template cũ chưa được phân loại, admin gán sau.
--    status mặc định 'draft': template đã tồn tại không tự nhiên thành
--    'published' sau khi migrate — admin phải chủ động publish.
-- ---------------------------------------------------------------------
ALTER TABLE template
    ADD COLUMN IF NOT EXISTS category      VARCHAR(50),
    ADD COLUMN IF NOT EXISTS status        template_status NOT NULL DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS tier          template_tier   NOT NULL DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
    ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ     NOT NULL DEFAULT now();

-- ---------------------------------------------------------------------
-- 3. Index phục vụ bộ lọc của trang admin (?category=&status=&tier=)
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_template_status   ON template (status);
CREATE INDEX IF NOT EXISTS idx_template_category ON template (category);

-- ---------------------------------------------------------------------
-- 4. Trigger tự cập nhật updated_at.
--    GORM đã tự set khi Save, trigger chỉ để các câu UPDATE chạy tay
--    (script, psql) cũng không làm mốc thời gian bị đứng yên.
-- ---------------------------------------------------------------------
DROP TRIGGER IF EXISTS trg_template_updated ON template;
CREATE TRIGGER trg_template_updated BEFORE UPDATE ON template
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
