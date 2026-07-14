-- =====================================================================
-- 002 UP: Chuyển published_url (slug công khai) từ published_snapshot sang landing_page
--
-- LÝ DO ĐỔI MÔ HÌNH:
--   Slug là ĐỊA CHỈ của trang -> thuộc về landing_page, phải bền qua mọi lần publish.
--   published_snapshot là LỊCH SỬ từng lần publish -> chỉ giữ nội dung + thời điểm.
--
--   Ở schema cũ (slug nằm trên snapshot, UNIQUE) mỗi lần publish lại sinh slug mới:
--     - link đã chia sẻ / đã chạy quảng cáo bị chết sau mỗi lần sửa trang;
--     - các slug cũ vẫn trỏ tới trang đang publish nên tiếp tục serve nội dung LỖI THỜI.
--
--   Sau migration này:
--     - /p/:slug tra trên landing_page rồi lấy snapshot MỚI NHẤT -> luôn đúng nội dung;
--     - republish giữ nguyên slug -> link bền;
--     - nhiều snapshot cùng 1 page là bình thường -> lịch sử publish được giữ đầy đủ.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- 1. Thêm slug vào landing_page. NULL = trang chưa từng publish.
--    UNIQUE cho phép nhiều NULL trong Postgres nên trang chưa publish không xung đột.
-- ---------------------------------------------------------------------
ALTER TABLE landing_page ADD COLUMN IF NOT EXISTS published_url VARCHAR(255);

ALTER TABLE landing_page
    ADD CONSTRAINT uq_landing_page_published_url UNIQUE (published_url);

-- ---------------------------------------------------------------------
-- 2. Migrate dữ liệu cũ (nếu có): slug của snapshot MỚI NHẤT mỗi page
--    trở thành slug chính thức của page đó.
--    Bảng rỗng thì câu lệnh này không làm gì — không cần chạy tay bước nào.
-- ---------------------------------------------------------------------
UPDATE landing_page lp
SET published_url = s.published_url
FROM (
    SELECT DISTINCT ON (landing_page_id) landing_page_id, published_url
    FROM published_snapshot
    ORDER BY landing_page_id, published_at DESC
) s
WHERE lp.landing_page_id = s.landing_page_id;

-- ---------------------------------------------------------------------
-- 3. published_snapshot: bỏ UNIQUE + NOT NULL của published_url.
--    Từ nay backend KHÔNG ghi cột này nữa (slug đã nằm trên landing_page).
--    Cột được giữ lại ở dạng nullable để migration này không phá dữ liệu cũ —
--    khi team xác nhận không còn cần tra cứu lịch sử slug, xóa hẳn bằng:
--        ALTER TABLE published_snapshot DROP COLUMN published_url;
-- ---------------------------------------------------------------------
ALTER TABLE published_snapshot DROP CONSTRAINT IF EXISTS published_snapshot_published_url_key;
ALTER TABLE published_snapshot ALTER COLUMN published_url DROP NOT NULL;

-- ---------------------------------------------------------------------
-- 4. Index phục vụ route công khai /p/:slug
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_lp_published_url
    ON landing_page (published_url)
    WHERE published_url IS NOT NULL;

COMMIT;
