package repository

import (
	"errors"

	"github.com/google/uuid"
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"gorm.io/gorm"
)

type SubscriptionRepository struct {
	db *gorm.DB
}

func NewSubscriptionRepository(db *gorm.DB) *SubscriptionRepository {
	return &SubscriptionRepository{db: db}
}

// Tạo mới một đăng ký (trạng thái pending)
func (r *SubscriptionRepository) Create(sub *models.Subscription) error {
	return r.db.Create(sub).Error
}

// Lấy đăng ký theo ID (Order ID từ MoMo trả về).
// Cột khoá chính là subscription_id chứ không phải id.
func (r *SubscriptionRepository) FindByID(id uuid.UUID) (*models.Subscription, error) {
	var sub models.Subscription
	err := r.db.Where("subscription_id = ?", id).First(&sub).Error
	// Tách "không có đơn" khỏi "DB lỗi": webhook cần phân biệt hai ca này để
	// quyết định có bảo MoMo gọi lại hay không.
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &sub, nil
}

// Cập nhật trạng thái đăng ký
func (r *SubscriptionRepository) Update(sub *models.Subscription) error {
	return r.db.Save(sub).Error
}

// ActivateAndUpgradeUser kích hoạt đơn đã thanh toán VÀ nâng gói user, trong
// MỘT transaction duy nhất.
//
// Vì sao phải gộp, không tách thành 3 lệnh rời: nếu hỏng ở giữa chừng thì hệ
// thống kẹt ở trạng thái không tự phục hồi được — subscription cũ đã bị expire,
// đơn mới chưa active, khách đã trả tiền nhưng vẫn ở gói free. Gộp vào tx thì
// hoặc xong hết, hoặc rollback sạch để MoMo gọi lại.
//
// Vì sao repository của subscription lại ghi vào bảng app_user: đây là một
// thao tác nghiệp vụ nguyên tử, không thể chẻ sang UserRepository mà vẫn giữ
// được cùng một transaction.
func (r *SubscriptionRepository) ActivateAndUpgradeUser(subID, userID uuid.UUID, paymentRef string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// 1. Dọn subscription active cũ TRƯỚC. Index uq_subscription_active_per_user
		//    chỉ cho phép mỗi user đúng 1 dòng active, gia hạn lần 2 sẽ vi phạm
		//    unique nếu không dọn.
		if err := tx.Model(&models.Subscription{}).
			Where("user_id = ? AND status = ? AND subscription_id <> ?", userID, models.SubActive, subID).
			Update("status", models.SubExpired).Error; err != nil {
			return err
		}

		// 2. Kích hoạt đơn vừa thanh toán, kèm mã giao dịch MoMo để đối soát.
		res := tx.Model(&models.Subscription{}).
			Where("subscription_id = ?", subID).
			Updates(map[string]any{
				"status":      models.SubActive,
				"payment_ref": paymentRef,
			})
		if res.Error != nil {
			return res.Error
		}
		if res.RowsAffected == 0 {
			return ErrNotFound
		}

		// 3. Nâng gói user. Ghi thẳng cột plan_type thay vì Save(user) để không
		//    ghi đè các cột khác bằng dữ liệu đã đọc từ trước đó.
		res = tx.Model(&models.User{}).
			Where("user_id = ?", userID).
			Update("plan_type", models.PlanPro)
		if res.Error != nil {
			return res.Error
		}
		if res.RowsAffected == 0 {
			return ErrNotFound
		}

		return nil
	})
}
