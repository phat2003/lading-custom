-- Rollback: xóa toàn bộ bảng và type
DROP TABLE IF EXISTS published_snapshot CASCADE;
DROP TABLE IF EXISTS media_asset CASCADE;
DROP TABLE IF EXISTS page_section CASCADE;
DROP TABLE IF EXISTS landing_page CASCADE;
DROP TABLE IF EXISTS template_section CASCADE;
DROP TABLE IF EXISTS template CASCADE;
DROP TABLE IF EXISTS section_template_library CASCADE;
DROP TABLE IF EXISTS project CASCADE;
DROP TABLE IF EXISTS subscription CASCADE;
DROP TABLE IF EXISTS app_user CASCADE;

DROP FUNCTION IF EXISTS set_updated_at CASCADE;

DROP TYPE IF EXISTS landing_page_status;
DROP TYPE IF EXISTS template_source;
DROP TYPE IF EXISTS template_type;
DROP TYPE IF EXISTS subscription_status;
DROP TYPE IF EXISTS plan_type;
DROP TYPE IF EXISTS user_role;
