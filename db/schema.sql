-- =====================================================================
-- LANDING PAGE BUILDER — PostgreSQL Schema (MVP)
-- Dựa trên Requirement Document, mục 10 (Data Model Overview)
-- PostgreSQL 14+ (dùng gen_random_uuid từ pgcrypto)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Extensions & ENUM types
-- ---------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- cung cấp gen_random_uuid()

-- Vai trò người dùng
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'user');

-- Gói dịch vụ
CREATE TYPE plan_type AS ENUM ('free', 'pro');

-- Trạng thái subscription
CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled');
-- Loại template: system (do admin tạo) | user (user lưu từ landing page)
CREATE TYPE template_type AS ENUM ('system', 'user');

-- Nguồn gốc sinh ra template (phục vụ audit & phân quyền)
CREATE TYPE template_source AS ENUM ('created_by_admin', 'saved_from_landing_page');

-- Trạng thái hiển thị của template trong thư viện (trang admin Templates)
CREATE TYPE template_status AS ENUM ('draft', 'published');

-- Phân hạng template: free dùng được cho mọi user, premium chỉ gói Pro
CREATE TYPE template_tier AS ENUM ('free', 'premium');

-- Trạng thái landing page
CREATE TYPE landing_page_status AS ENUM ('draft', 'published');

-- Trạng thái một lượt tạo thiết kế bằng AI
CREATE TYPE ai_generation_status AS ENUM ('generating', 'done', 'failed');

-- =====================================================================
-- 1. USER
--    1 User có nhiều Project; là owner của User Template.
-- =====================================================================
CREATE TABLE app_user (
    user_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(150),
    role          user_role NOT NULL DEFAULT 'user',
    plan_type     plan_type NOT NULL DEFAULT 'free',   -- denormalized: gói hiện tại

    -- Field quản trị (xem migration 004).
    phone           VARCHAR(20),                                   -- cột Contact ở trang admin Users
    -- Công tắc khoá tài khoản do admin bật/tắt thủ công.
    -- KHÔNG suy ra từ "lâu không đăng nhập" nên không cần last_login_at.
    is_active       BOOLEAN     NOT NULL DEFAULT true,
    timezone        VARCHAR(64) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    session_timeout VARCHAR(16) NOT NULL DEFAULT 'never',           -- never | 30m | 1h | 1d

    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_role      ON app_user (role);
CREATE INDEX idx_user_is_active ON app_user (is_active);

-- =====================================================================
-- 2. PLAN / SUBSCRIPTION
--    1 User có 1 subscription "hiện tại" (active), nhưng giữ lịch sử.
--    Tách khỏi User để xử lý gia hạn, hết hạn, lịch sử thanh toán.
-- =====================================================================
CREATE TABLE subscription (
    subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    plan_type       plan_type NOT NULL,
    status          subscription_status NOT NULL DEFAULT 'active',
    started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    expired_at      TIMESTAMPTZ,                      -- null = không hết hạn (free)
    payment_ref     VARCHAR(255),                     -- mã tham chiếu thanh toán
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscription_user ON subscription (user_id);
-- Mỗi user chỉ có tối đa 1 subscription ở trạng thái 'active'
CREATE UNIQUE INDEX uq_subscription_active_per_user
    ON subscription (user_id)
    WHERE status = 'active';

-- =====================================================================
-- 3. PROJECT
--    1 Project có nhiều Landing Page; thuộc về 1 User (owner).
-- =====================================================================
CREATE TABLE project (
    project_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name       VARCHAR(200) NOT NULL,
    owner_id   UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_project_owner ON project (owner_id);

-- =====================================================================
-- 4. SECTION TEMPLATE LIBRARY
--    Thư viện section mẫu TOÀN CỤC do Admin quản lý.
--    Hiển thị trong panel cạnh editor; làm nguồn seed default_content.
-- =====================================================================
CREATE TABLE section_template_library (
    section_template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_type        VARCHAR(50) NOT NULL,   -- hero | features | testimonials | faq | footer | cta | gallery ...
    display_name        VARCHAR(150) NOT NULL,
    default_content     JSONB NOT NULL,         -- placeholder text & image
    thumbnail_url       TEXT,
    created_by          UUID REFERENCES app_user(user_id) ON DELETE SET NULL,  -- admin
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sectionlib_type ON section_template_library (section_type);

-- =====================================================================
-- 5. TEMPLATE
--    type = system  -> owner_id NULL, source = created_by_admin
--    type = user    -> owner_id = user, source = saved_from_landing_page
--    1 Template có nhiều Template Section.
-- =====================================================================
CREATE TABLE template (
    template_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200) NOT NULL,
    type            template_type NOT NULL,
    owner_id        UUID REFERENCES app_user(user_id) ON DELETE CASCADE,  -- NULL nếu system
    template_source template_source NOT NULL,

    -- Metadata phục vụ trang admin Templates (xem migration 003).
    -- Số section KHÔNG lưu ở đây — đếm từ template_section để không bị lệch.
    category        VARCHAR(50),                                  -- SaaS | Agency | Startup | Webinar | Portfolio ...
    status          template_status NOT NULL DEFAULT 'draft',
    tier            template_tier   NOT NULL DEFAULT 'free',
    thumbnail_url   TEXT,                                         -- ảnh xem trước trên thẻ template

    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Ràng buộc tính nhất quán giữa type / owner / source:
    --  system  => không có owner, sinh bởi admin
    --  user    => phải có owner, lưu từ landing page
    CONSTRAINT chk_template_type_consistency CHECK (
        (type = 'system' AND owner_id IS NULL     AND template_source = 'created_by_admin')
        OR
        (type = 'user'   AND owner_id IS NOT NULL AND template_source = 'saved_from_landing_page')
    )
);

CREATE INDEX idx_template_owner    ON template (owner_id);
CREATE INDEX idx_template_type     ON template (type);
-- Phục vụ bộ lọc của trang admin: ?category=&status=&tier=
CREATE INDEX idx_template_status   ON template (status);
CREATE INDEX idx_template_category ON template (category);

-- =====================================================================
-- 6. TEMPLATE SECTION  (con của Template)
--    Snapshot nội dung thuộc về 1 Template cụ thể.
--    source_section_template_id: ghi lại section mẫu gốc đã seed (nếu có).
-- =====================================================================
CREATE TABLE template_section (
    section_id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id               UUID NOT NULL REFERENCES template(template_id) ON DELETE CASCADE,
    section_type              VARCHAR(50) NOT NULL,
    section_content           JSONB NOT NULL,
    order_index               INT NOT NULL DEFAULT 0,
    source_section_template_id UUID REFERENCES section_template_library(section_template_id) ON DELETE SET NULL,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_tplsection_template ON template_section (template_id);
-- Giữ thứ tự section trong cùng 1 template là duy nhất
CREATE UNIQUE INDEX uq_tplsection_order ON template_section (template_id, order_index);

-- =====================================================================
-- 7. LANDING PAGE
--    Thuộc 1 Project; tạo từ 1 nguồn khởi tạo (template) hoặc Blank.
--    source_template_id NULL nếu tạo từ Blank.
-- =====================================================================
CREATE TABLE landing_page (
    landing_page_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id        UUID NOT NULL REFERENCES project(project_id) ON DELETE CASCADE,
    name              VARCHAR(200) NOT NULL,
    source_template_id UUID REFERENCES template(template_id) ON DELETE SET NULL,  -- NULL = Blank
    status            landing_page_status NOT NULL DEFAULT 'draft',
    -- Slug công khai (/p/:slug). NULL = chưa từng publish.
    -- Slug thuộc về TRANG nên bền qua mọi lần republish và cả unpublish -> publish lại.
    published_url     VARCHAR(255) UNIQUE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_lp_project ON landing_page (project_id);
CREATE INDEX idx_lp_status  ON landing_page (status);
CREATE INDEX idx_lp_published_url ON landing_page (published_url) WHERE published_url IS NOT NULL;

-- =====================================================================
-- 8. PAGE SECTION  (con của Landing Page)
--    Nội dung thực tế user đã chỉnh sửa. Độc lập với Template Section.
-- =====================================================================
CREATE TABLE page_section (
    section_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landing_page_id UUID NOT NULL REFERENCES landing_page(landing_page_id) ON DELETE CASCADE,
    section_type    VARCHAR(50) NOT NULL,
    content         JSONB NOT NULL,                 -- nội dung đã chỉnh sửa
    order_index     INT NOT NULL DEFAULT 0,
    is_visible      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pagesection_lp ON page_section (landing_page_id);
CREATE UNIQUE INDEX uq_pagesection_order ON page_section (landing_page_id, order_index);

-- =====================================================================
-- 9. MEDIA ASSET
--    1 Landing Page có nhiều Media Asset.
--    landing_page_id nullable: hỗ trợ upload độc lập / tái sử dụng ảnh.
-- =====================================================================
CREATE TABLE media_asset (
    asset_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id        UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    landing_page_id UUID REFERENCES landing_page(landing_page_id) ON DELETE SET NULL,
    file_url        TEXT NOT NULL,
    file_type       VARCHAR(50) NOT NULL,           -- image/png | image/jpeg | ...
    file_size       BIGINT,                         -- bytes
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_media_owner ON media_asset (owner_id);
CREATE INDEX idx_media_lp    ON media_asset (landing_page_id);

-- =====================================================================
-- 10. PUBLISHED SNAPSHOT
--     Bản chụp nội dung tại thời điểm publish — bản ghi LỊCH SỬ.
--     Mỗi lần publish tạo thêm 1 hàng; snapshot mới nhất = bản đang live.
--     Slug công khai KHÔNG nằm ở đây mà ở landing_page.published_url
--     (xem migration 002_move_slug_to_page): slug thuộc về trang, snapshot chỉ giữ nội dung.
-- =====================================================================
CREATE TABLE published_snapshot (
    snapshot_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    landing_page_id  UUID NOT NULL REFERENCES landing_page(landing_page_id) ON DELETE CASCADE,
    snapshot_content JSONB NOT NULL,                 -- toàn bộ nội dung tại thời điểm publish
    published_by     UUID REFERENCES app_user(user_id) ON DELETE SET NULL,
    published_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_snapshot_lp ON published_snapshot (landing_page_id);

-- =====================================================================
-- 11. PLATFORM SETTING — cấu hình hệ thống (xem migration 005)
--     Chỉ tồn tại ĐÚNG 1 dòng cho toàn hệ thống, ràng buộc bằng unique
--     index trên cột hằng is_singleton.
--     Phần "tài khoản" của trang Settings (họ tên, múi giờ, thời gian phiên)
--     KHÔNG nằm ở đây mà ở app_user của admin đang đăng nhập.
-- =====================================================================
CREATE TABLE platform_setting (
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

    is_singleton BOOLEAN NOT NULL DEFAULT true CHECK (is_singleton)
);

CREATE UNIQUE INDEX uq_platform_setting_singleton ON platform_setting (is_singleton);

-- Dòng cấu hình mặc định
INSERT INTO platform_setting DEFAULT VALUES;

-- =====================================================================
-- 12. PRICING PLAN — bảng giá hiển thị (xem migration 006)
--     code là VARCHAR, ĐỘC LẬP với ENUM plan_type: bảng này lo phần hiển thị
--     (giá, tính năng, thứ tự), còn user thuộc gói nào vẫn do app_user.plan_type
--     quyết định. Thêm gói mới bán được cho user thì phải ALTER TYPE plan_type.
-- =====================================================================
CREATE TABLE pricing_plan (
    plan_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code         VARCHAR(30)  NOT NULL UNIQUE,          -- 'free' | 'pro' | ...
    name         VARCHAR(100) NOT NULL,
    label        VARCHAR(100),                          -- nhãn phụ: 'Cơ bản' | 'Doanh nghiệp'
    price        BIGINT       NOT NULL DEFAULT 0,       -- VNĐ, số nguyên
    unit         VARCHAR(20)  NOT NULL DEFAULT '/tháng',
    highlighted  BOOLEAN      NOT NULL DEFAULT false,
    badge        VARCHAR(50),
    sort_order   INT          NOT NULL DEFAULT 0,
    is_active    BOOLEAN      NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE plan_feature (
    feature_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id     UUID NOT NULL REFERENCES pricing_plan(plan_id) ON DELETE CASCADE,
    label       VARCHAR(200) NOT NULL,
    included    BOOLEAN NOT NULL DEFAULT true,          -- ✓ hay ✕
    sort_order  INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_plan_feature_plan ON plan_feature (plan_id);

-- =====================================================================
-- 13. AI GENERATION — lịch sử tạo thiết kế bằng AI (xem migration 007)
--     Phần gọi mô hình AI thật nằm ngoài phạm vi hiện tại; bảng và API đã
--     sẵn sàng, chỗ cắm mô hình nằm ở internal/service/ai_service.go.
-- =====================================================================
CREATE TABLE ai_generation (
    generation_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID NOT NULL REFERENCES app_user(user_id) ON DELETE CASCADE,
    prompt         TEXT NOT NULL,
    template_type  VARCHAR(50),                 -- 'landing' | 'portfolio' | ...
    style          VARCHAR(50),
    status         ai_generation_status NOT NULL DEFAULT 'generating',
    tokens_used    INT DEFAULT 0,
    error_message  TEXT,                        -- chỉ có khi status = 'failed'
    result_template_id UUID REFERENCES template(template_id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at   TIMESTAMPTZ
);

CREATE INDEX idx_ai_generation_user_created ON ai_generation (user_id, created_at DESC);
CREATE INDEX idx_ai_generation_created      ON ai_generation (created_at DESC);

-- Hạn mức AI theo user; dòng được tạo lười khi user dùng AI lần đầu.
CREATE TABLE ai_credit (
    user_id   UUID PRIMARY KEY REFERENCES app_user(user_id) ON DELETE CASCADE,
    used      INT NOT NULL DEFAULT 0,
    total     INT NOT NULL DEFAULT 1000,
    reset_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days')
);

-- =====================================================================
-- 14. TRIGGER cập nhật updated_at tự động
-- =====================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_updated      BEFORE UPDATE ON app_user
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_project_updated   BEFORE UPDATE ON project
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_lp_updated        BEFORE UPDATE ON landing_page
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_pagesection_updated BEFORE UPDATE ON page_section
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_template_updated  BEFORE UPDATE ON template
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_platform_setting_updated BEFORE UPDATE ON platform_setting
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_pricing_plan_updated BEFORE UPDATE ON pricing_plan
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =====================================================================
-- 15. SEED DATA mẫu (tùy chọn — để test nhanh)
-- =====================================================================
-- Admin & user demo
-- Tài khoản dev: admin / Admin@123 | user / User@123
INSERT INTO app_user (email, password_hash, full_name, role, plan_type) VALUES
  ('admin@lpbuilder.com', '$2a$10$34GfT/s.37gU0r6lYJzt7uy7eZO1ryyVx0er75XBLgj.5d3rcLnBm', 'System Admin', 'admin', 'pro'),
  ('user@demo.com',       '$2a$10$y2FHix0JpFhytz99SrTQSO4.iIOdyHoNUZ8i/wfWmtMMVl5Y3VPQm', 'Demo User',    'user',  'free');

-- Section mẫu trong thư viện
INSERT INTO section_template_library (section_type, display_name, default_content, created_by)
SELECT 'hero', 'Hero Banner',
       '{"title":"Your Headline Here","subtitle":"Your subtitle","background_image":"placeholder.jpg"}'::jsonb,
       user_id
FROM app_user WHERE email = 'admin@lpbuilder.com';
