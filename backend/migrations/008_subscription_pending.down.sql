-- =====================================================================
-- 008 DOWN: Bỏ trạng thái 'pending' khỏi enum subscription_status
--
-- PostgreSQL không có ALTER TYPE ... DROP VALUE, nên phải dựng lại type.
--
-- MẤT DỮ LIỆU CÓ CHỦ Ý:
--   Mọi đơn đang 'pending' sẽ bị chuyển thành 'cancelled' — đó là các đơn
--   khách chưa trả tiền, coi như huỷ là đúng nghiệp vụ. Không đơn nào đang
--   'active' bị ảnh hưởng.
-- =====================================================================

BEGIN;

-- Dọn dữ liệu trước: không còn hàng nào mang giá trị sắp bị xoá khỏi enum.
UPDATE subscription SET status = 'cancelled' WHERE status = 'pending';

-- Index partial tham chiếu tới enum -> phải bỏ trước khi đổi kiểu cột.
DROP INDEX IF EXISTS uq_subscription_active_per_user;

ALTER TYPE subscription_status RENAME TO subscription_status_old;

CREATE TYPE subscription_status AS ENUM ('active', 'expired', 'cancelled');

ALTER TABLE subscription
    ALTER COLUMN status DROP DEFAULT,
    ALTER COLUMN status TYPE subscription_status
        USING status::text::subscription_status,
    ALTER COLUMN status SET DEFAULT 'active';

DROP TYPE subscription_status_old;

-- Dựng lại đúng như migration 001.
CREATE UNIQUE INDEX uq_subscription_active_per_user
    ON subscription (user_id)
    WHERE status = 'active';

COMMIT;
