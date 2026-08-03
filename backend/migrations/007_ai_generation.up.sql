-- =====================================================================
-- 007 UP: Bảng lịch sử tạo thiết kế bằng AI + hạn mức theo user
--
-- LÝ DO: trang AI Generator và khối "AI Generator Log" trên Dashboard chưa có
--   bất kỳ bảng nào; thẻ "AI Generated Pages" vì thế luôn hiển thị 0.
--
-- PHẠM VI: bảng và API được làm đầy đủ, nhưng phần GỌI MÔ HÌNH AI THẬT
--   (API bên thứ ba, xử lý bất đồng bộ, hàng đợi) nằm ngoài phạm vi — xem
--   ghi chú trong internal/service/ai_service.go.
-- =====================================================================

BEGIN;

DO $$ BEGIN
    CREATE TYPE ai_generation_status AS ENUM ('generating', 'done', 'failed');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS ai_generation (
    generation_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    prompt         TEXT NOT NULL,
    template_type  VARCHAR(50),                 -- 'landing' | 'portfolio' | ...
    style          VARCHAR(50),                 -- 'Glassmorphism Pro' | ...
    status         ai_generation_status NOT NULL DEFAULT 'generating',
    tokens_used    INT DEFAULT 0,
    error_message  TEXT,                        -- chỉ có khi status = 'failed'
    -- Template sinh ra (nếu có). SET NULL để xoá template không làm mất lịch sử.
    result_template_id UUID REFERENCES template(template_id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at   TIMESTAMPTZ
);

-- Phục vụ màn "lịch sử của tôi" (lọc theo user, mới nhất trước).
CREATE INDEX IF NOT EXISTS idx_ai_generation_user_created
    ON ai_generation (user_id, created_at DESC);

-- Phục vụ log toàn hệ thống trên Dashboard và câu đếm hạn mức theo ngày.
CREATE INDEX IF NOT EXISTS idx_ai_generation_created
    ON ai_generation (created_at DESC);

-- ---------------------------------------------------------------------
-- Hạn mức AI theo từng user. Dòng được tạo lười (lần đầu user dùng AI),
-- không seed sẵn cho toàn bộ user.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_credit (
    user_id   UUID PRIMARY KEY REFERENCES app_user(user_id) ON DELETE CASCADE,
    used      INT NOT NULL DEFAULT 0,
    total     INT NOT NULL DEFAULT 1000,
    reset_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

COMMIT;
