-- =====================================================================
-- 002 DOWN: Trả slug về lại published_snapshot (rollback của 002 UP)
--
-- LƯU Ý: rollback KHÔNG khôi phục được y nguyên trạng thái cũ.
--   Ở mô hình mới nhiều snapshot của cùng 1 page dùng chung 1 slug (slug nằm trên page),
--   nhưng schema cũ yêu cầu published_url UNIQUE trên từng snapshot.
--   Vì vậy khi rollback:
--     - snapshot MỚI NHẤT của mỗi page nhận lại đúng slug thật của page;
--     - các snapshot cũ hơn (nếu có, do republish nhiều lần) được cấp slug ngẫu nhiên
--       để thỏa ràng buộc UNIQUE — các slug này không có ý nghĩa nghiệp vụ.
-- =====================================================================

BEGIN;

-- 1. Cấp slug ngẫu nhiên cho mọi snapshot đang thiếu (sinh sau khi chạy 002 UP)
UPDATE published_snapshot
SET published_url = left(replace(gen_random_uuid()::text, '-', ''), 8)
WHERE published_url IS NULL;

-- 2. Snapshot mới nhất của mỗi page nhận lại slug thật từ landing_page
UPDATE published_snapshot ps
SET published_url = lp.published_url
FROM landing_page lp
WHERE lp.landing_page_id = ps.landing_page_id
  AND lp.published_url IS NOT NULL
  AND ps.snapshot_id = (
      SELECT x.snapshot_id
      FROM published_snapshot x
      WHERE x.landing_page_id = ps.landing_page_id
      ORDER BY x.published_at DESC
      LIMIT 1
  );

-- 3. Khôi phục ràng buộc cũ trên published_snapshot
ALTER TABLE published_snapshot ALTER COLUMN published_url SET NOT NULL;
ALTER TABLE published_snapshot
    ADD CONSTRAINT published_snapshot_published_url_key UNIQUE (published_url);

-- 4. Gỡ slug khỏi landing_page
DROP INDEX IF EXISTS idx_lp_published_url;
ALTER TABLE landing_page DROP CONSTRAINT IF EXISTS uq_landing_page_published_url;
ALTER TABLE landing_page DROP COLUMN IF EXISTS published_url;

COMMIT;
