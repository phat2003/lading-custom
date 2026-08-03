-- =====================================================================
-- 006 DOWN: Gỡ bảng gói dịch vụ (rollback của 006 UP)
--
-- LƯU Ý: rollback XOÁ DỮ LIỆU — toàn bộ gói giá và danh sách tính năng
--   đã cấu hình sẽ mất. Chạy lại 006 UP chỉ khôi phục 2 gói seed mặc định.
--
--   Không ảnh hưởng tới gói hiện tại của user: app_user.plan_type là ENUM
--   riêng, không tham chiếu sang bảng này.
-- =====================================================================

BEGIN;

DROP TRIGGER IF EXISTS trg_pricing_plan_updated ON pricing_plan;

-- plan_feature xoá trước (hoặc để CASCADE lo) — DROP theo thứ tự con trước cha.
DROP TABLE IF EXISTS plan_feature;
DROP TABLE IF EXISTS pricing_plan;

COMMIT;
