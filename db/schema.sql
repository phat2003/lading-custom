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
    -- Metadata SEO theo từng Landing Page; object rỗng giữ tương thích với trang cũ.
    seo_settings      JSONB NOT NULL DEFAULT '{}'::jsonb,
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

-- ---------------------------------------------------------------------
-- Template mau dung chung cho ca team (nap san khi dung DB lan dau).
--
-- section_content theo dung dinh dang builder sinh ra: { "elements": [...] }
-- Moi element: { id, type, content, x, y, parentId, style }
--   parentId = null  -> Section (khung ngoai, toa do so voi trang)
--   parentId = <id>  -> phan tu con, toa do so voi Section cha
-- Section rong 960px cho khop "K/thuoc Desktop" mac dinh o Thiet lap trang.
-- UUID co dinh de nap lai khong sinh ban trung.
-- ---------------------------------------------------------------------
-- thumbnail_url tro toi file SVG trong frontend/public/templates/ (co commit vao git),
-- KHONG dung backend/uploads/ vi thu muc do bi .gitignore -> may khac se hong anh.
INSERT INTO template (template_id, name, type, owner_id, template_source, category, status, tier, thumbnail_url) VALUES
  ('11111111-1111-4111-8111-111111111111', 'SaaS Landing Pro', 'system', NULL, 'created_by_admin', 'SaaS',    'published', 'premium', '/templates/saas-landing-pro.svg'),
  ('22222222-2222-4222-8222-222222222222', 'Agency Showcase',  'system', NULL, 'created_by_admin', 'Agency',  'published', 'free',    '/templates/agency-showcase.svg'),
  ('33333333-3333-4333-8333-333333333333', 'Startup Launch',   'system', NULL, 'created_by_admin', 'Startup', 'draft',     'free',    '/templates/startup-launch.svg');

INSERT INTO template_section (template_id, section_type, order_index, section_content) VALUES
  ('11111111-1111-4111-8111-111111111111', 'hero', 0, '{"elements":[{"id":"t1s0","type":"section","content":"","x":0,"y":0,"parentId":null,"sectionType":"hero","style":{"width":960,"height":380,"bgColor":"#f8fafc","borderRadius":0,"columns":1}},{"id":"t1s0a","type":"heading","content":"Giải pháp SaaS cho doanh nghiệp hiện đại","x":180,"y":90,"parentId":"t1s0","style":{"width":600,"fontSize":40,"fontFamily":"Inter","fontWeight":800,"color":"#0f172a","textAlign":"center"}},{"id":"t1s0b","type":"paragraph","content":"Tăng trưởng nhanh hơn với nền tảng quản lý toàn diện, dễ dùng và tiết kiệm chi phí.","x":210,"y":180,"parentId":"t1s0","style":{"width":540,"fontSize":16,"fontFamily":"Inter","color":"#475569","textAlign":"center"}},{"id":"t1s0c","type":"button","content":"Dùng thử miễn phí","x":400,"y":250,"parentId":"t1s0","style":{"width":160,"height":46,"fontSize":15,"fontFamily":"Inter","fontWeight":600,"color":"#ffffff","bgColor":"#2563eb","borderRadius":8}}]}'::jsonb),
  ('11111111-1111-4111-8111-111111111111', 'features', 1, '{"elements":[{"id":"t1s1","type":"section","content":"","x":0,"y":381,"parentId":null,"sectionType":"features","style":{"width":960,"height":320,"bgColor":"#ffffff","borderRadius":0,"columns":3}},{"id":"t1s1a","type":"heading","content":"Tính năng nổi bật","x":370,"y":30,"parentId":"t1s1","style":{"width":220,"fontSize":26,"fontFamily":"Inter","fontWeight":700,"color":"#0f172a","textAlign":"center"}},{"id":"t1s1b","type":"iconbox","content":"Nhanh chóng|Tốc độ xử lý vượt trội.","x":80,"y":110,"parentId":"t1s1","style":{"width":200,"fontSize":16,"fontFamily":"Inter","color":"#111827","textAlign":"center"}},{"id":"t1s1c","type":"iconbox","content":"An toàn|Bảo mật dữ liệu tối đa.","x":380,"y":110,"parentId":"t1s1","style":{"width":200,"fontSize":16,"fontFamily":"Inter","color":"#111827","textAlign":"center"}},{"id":"t1s1d","type":"iconbox","content":"Dễ dùng|Giao diện trực quan.","x":680,"y":110,"parentId":"t1s1","style":{"width":200,"fontSize":16,"fontFamily":"Inter","color":"#111827","textAlign":"center"}}]}'::jsonb),
  ('11111111-1111-4111-8111-111111111111', 'pricing', 2, '{"elements":[{"id":"t1s2","type":"section","content":"","x":0,"y":702,"parentId":null,"sectionType":"pricing","style":{"width":960,"height":380,"bgColor":"#f8fafc","borderRadius":0,"columns":3}},{"id":"t1s2a","type":"heading","content":"Bảng giá","x":420,"y":28,"parentId":"t1s2","style":{"width":120,"fontSize":28,"fontFamily":"Inter","fontWeight":700,"color":"#0f172a","textAlign":"center"}},{"id":"t1s2b","type":"card","content":"Cơ bản|0đ / tháng","x":90,"y":100,"parentId":"t1s2","style":{"width":220,"height":230,"bgColor":"#ffffff","borderRadius":12,"boxShadow":"0 4px 12px rgba(0,0,0,0.1)","fontSize":18,"fontFamily":"Inter","color":"#111827","textAlign":"center"}},{"id":"t1s2c","type":"card","content":"Pro|299.000đ / tháng","x":370,"y":90,"parentId":"t1s2","style":{"width":220,"height":250,"bgColor":"#2563eb","borderRadius":12,"boxShadow":"0 6px 16px rgba(37,99,235,0.3)","fontSize":18,"fontFamily":"Inter","color":"#ffffff","textAlign":"center"}},{"id":"t1s2d","type":"card","content":"Doanh nghiệp|Liên hệ","x":650,"y":100,"parentId":"t1s2","style":{"width":220,"height":230,"bgColor":"#ffffff","borderRadius":12,"boxShadow":"0 4px 12px rgba(0,0,0,0.1)","fontSize":18,"fontFamily":"Inter","color":"#111827","textAlign":"center"}}]}'::jsonb),
  ('11111111-1111-4111-8111-111111111111', 'cta', 3, '{"elements":[{"id":"t1s3","type":"section","content":"","x":0,"y":1083,"parentId":null,"sectionType":"cta","style":{"width":960,"height":200,"bgColor":"#2563eb","borderRadius":0,"columns":1}},{"id":"t1s3a","type":"heading","content":"Sẵn sàng bắt đầu?","x":330,"y":55,"parentId":"t1s3","style":{"width":300,"fontSize":28,"fontFamily":"Inter","fontWeight":700,"color":"#ffffff","textAlign":"center"}},{"id":"t1s3b","type":"button","content":"Đăng ký ngay","x":390,"y":115,"parentId":"t1s3","style":{"width":180,"height":46,"fontSize":15,"fontFamily":"Inter","fontWeight":600,"color":"#2563eb","bgColor":"#ffffff","borderRadius":8}}]}'::jsonb),
  ('22222222-2222-4222-8222-222222222222', 'header', 0, '{"elements":[{"id":"t2s0","type":"section","content":"","x":0,"y":0,"parentId":null,"sectionType":"header","style":{"width":960,"height":72,"bgColor":"#ffffff","borderRadius":0,"columns":1}},{"id":"t2s0a","type":"label","content":"AGENCY","x":40,"y":24,"parentId":"t2s0","style":{"width":120,"fontSize":20,"fontFamily":"Inter","fontWeight":800,"color":"#111827"}},{"id":"t2s0b","type":"menu","content":"Trang chủ\nDịch vụ\nDự án\nLiên hệ","x":380,"y":26,"parentId":"t2s0","style":{"width":360,"fontSize":14,"fontFamily":"Inter","color":"#374151","textAlign":"center"}},{"id":"t2s0c","type":"button","content":"Báo giá","x":810,"y":16,"parentId":"t2s0","style":{"width":110,"height":40,"fontSize":13,"fontFamily":"Inter","fontWeight":600,"color":"#ffffff","bgColor":"#111827","borderRadius":8}}]}'::jsonb),
  ('22222222-2222-4222-8222-222222222222', 'about', 1, '{"elements":[{"id":"t2s1","type":"section","content":"","x":0,"y":73,"parentId":null,"sectionType":"about","style":{"width":960,"height":300,"bgColor":"#ffffff","borderRadius":0,"columns":2}},{"id":"t2s1a","type":"image","content":"","x":70,"y":60,"parentId":"t2s1","style":{"width":320,"height":180,"borderRadius":12}},{"id":"t2s1b","type":"heading","content":"Về chúng tôi","x":450,"y":70,"parentId":"t2s1","style":{"width":420,"fontSize":26,"fontFamily":"Inter","fontWeight":700,"color":"#0f172a","textAlign":"left"}},{"id":"t2s1c","type":"paragraph","content":"Chúng tôi là agency chuyên thiết kế và triển khai chiến dịch số cho doanh nghiệp vừa và nhỏ.","x":450,"y":120,"parentId":"t2s1","style":{"width":420,"fontSize":16,"fontFamily":"Inter","color":"#475569","textAlign":"left"}}]}'::jsonb),
  ('22222222-2222-4222-8222-222222222222', 'team', 2, '{"elements":[{"id":"t2s2","type":"section","content":"","x":0,"y":374,"parentId":null,"sectionType":"team","style":{"width":960,"height":300,"bgColor":"#f8fafc","borderRadius":0,"columns":3}},{"id":"t2s2a","type":"heading","content":"Đội ngũ của chúng tôi","x":350,"y":28,"parentId":"t2s2","style":{"width":260,"fontSize":26,"fontFamily":"Inter","fontWeight":700,"color":"#0f172a","textAlign":"center"}},{"id":"t2s2b","type":"card","content":"Nguyễn An|Giám đốc sáng tạo","x":130,"y":100,"parentId":"t2s2","style":{"width":190,"height":150,"bgColor":"#ffffff","borderRadius":12,"boxShadow":"0 4px 12px rgba(0,0,0,0.1)","fontSize":18,"fontFamily":"Inter","color":"#111827","textAlign":"center"}},{"id":"t2s2c","type":"card","content":"Trần Bình|Trưởng nhóm thiết kế","x":385,"y":100,"parentId":"t2s2","style":{"width":190,"height":150,"bgColor":"#ffffff","borderRadius":12,"boxShadow":"0 4px 12px rgba(0,0,0,0.1)","fontSize":18,"fontFamily":"Inter","color":"#111827","textAlign":"center"}},{"id":"t2s2d","type":"card","content":"Lê Chi|Quản lý dự án","x":640,"y":100,"parentId":"t2s2","style":{"width":190,"height":150,"bgColor":"#ffffff","borderRadius":12,"boxShadow":"0 4px 12px rgba(0,0,0,0.1)","fontSize":18,"fontFamily":"Inter","color":"#111827","textAlign":"center"}}]}'::jsonb),
  ('22222222-2222-4222-8222-222222222222', 'footer', 3, '{"elements":[{"id":"t2s3","type":"section","content":"","x":0,"y":675,"parentId":null,"sectionType":"footer","style":{"width":960,"height":160,"bgColor":"#0f172a","borderRadius":0,"columns":1}},{"id":"t2s3a","type":"label","content":"Giới thiệu  ·  Điều khoản  ·  Liên hệ","x":330,"y":50,"parentId":"t2s3","style":{"width":300,"fontSize":14,"fontFamily":"Inter","color":"#e2e8f0","textAlign":"center"}},{"id":"t2s3b","type":"label","content":"© 2026 Agency. All rights reserved.","x":330,"y":100,"parentId":"t2s3","style":{"width":300,"fontSize":13,"fontFamily":"Inter","color":"#94a3b8","textAlign":"center"}}]}'::jsonb),
  ('33333333-3333-4333-8333-333333333333', 'hero', 0, '{"elements":[{"id":"t3s0","type":"section","content":"","x":0,"y":0,"parentId":null,"sectionType":"hero","style":{"width":960,"height":360,"bgColor":"#ffffff","borderRadius":0,"columns":1}},{"id":"t3s0a","type":"heading","content":"Ra mắt sản phẩm của bạn","x":230,"y":100,"parentId":"t3s0","style":{"width":500,"fontSize":38,"fontFamily":"Inter","fontWeight":800,"color":"#0f172a","textAlign":"center"}},{"id":"t3s0b","type":"paragraph","content":"Trang đích gọn gàng giúp bạn thu thập đăng ký sớm ngay từ ngày đầu.","x":250,"y":180,"parentId":"t3s0","style":{"width":460,"fontSize":16,"fontFamily":"Inter","color":"#475569","textAlign":"center"}},{"id":"t3s0c","type":"input","content":"Nhập email của bạn","x":320,"y":240,"parentId":"t3s0","style":{"width":240,"height":44,"fontSize":14,"fontFamily":"Inter","color":"#111827","bgColor":"#ffffff","borderRadius":8,"borderWidth":1,"borderColor":"#cbd5e1"}},{"id":"t3s0d","type":"button","content":"Đăng ký","x":575,"y":240,"parentId":"t3s0","style":{"width":110,"height":44,"fontSize":14,"fontFamily":"Inter","fontWeight":600,"color":"#ffffff","bgColor":"#111827","borderRadius":8}}]}'::jsonb),
  ('33333333-3333-4333-8333-333333333333', 'stats', 1, '{"elements":[{"id":"t3s1","type":"section","content":"","x":0,"y":361,"parentId":null,"sectionType":"stats","style":{"width":960,"height":180,"bgColor":"#0f172a","borderRadius":0,"columns":3}},{"id":"t3s1n0","type":"heading","content":"1,200+","x":150,"y":50,"parentId":"t3s1","style":{"width":160,"fontSize":34,"fontFamily":"Inter","fontWeight":800,"color":"#ffffff","textAlign":"center"}},{"id":"t3s1l0","type":"label","content":"Người đăng ký","x":150,"y":112,"parentId":"t3s1","style":{"width":160,"fontSize":14,"fontFamily":"Inter","color":"#94a3b8","textAlign":"center"}},{"id":"t3s1n1","type":"heading","content":"98%","x":400,"y":50,"parentId":"t3s1","style":{"width":160,"fontSize":34,"fontFamily":"Inter","fontWeight":800,"color":"#ffffff","textAlign":"center"}},{"id":"t3s1l1","type":"label","content":"Hài lòng","x":400,"y":112,"parentId":"t3s1","style":{"width":160,"fontSize":14,"fontFamily":"Inter","color":"#94a3b8","textAlign":"center"}},{"id":"t3s1n2","type":"heading","content":"50+","x":650,"y":50,"parentId":"t3s1","style":{"width":160,"fontSize":34,"fontFamily":"Inter","fontWeight":800,"color":"#ffffff","textAlign":"center"}},{"id":"t3s1l2","type":"label","content":"Đối tác","x":650,"y":112,"parentId":"t3s1","style":{"width":160,"fontSize":14,"fontFamily":"Inter","color":"#94a3b8","textAlign":"center"}}]}'::jsonb),
  ('33333333-3333-4333-8333-333333333333', 'faq', 2, '{"elements":[{"id":"t3s2","type":"section","content":"","x":0,"y":542,"parentId":null,"sectionType":"faq","style":{"width":960,"height":300,"bgColor":"#f8fafc","borderRadius":0,"columns":1}},{"id":"t3s2a","type":"heading","content":"Câu hỏi thường gặp","x":350,"y":28,"parentId":"t3s2","style":{"width":260,"fontSize":26,"fontFamily":"Inter","fontWeight":700,"color":"#0f172a","textAlign":"center"}},{"id":"t3s2b","type":"list","content":"Làm sao để đăng ký tài khoản?\nChính sách hoàn tiền như thế nào?\nHỗ trợ kỹ thuật ra sao?\nCó dùng thử miễn phí không?","x":180,"y":100,"parentId":"t3s2","style":{"width":600,"fontSize":16,"fontFamily":"Inter","color":"#374151","textAlign":"left"}}]}'::jsonb);
