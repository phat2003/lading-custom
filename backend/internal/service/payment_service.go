package service

import (
	"errors"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

// ProPlanPriceVND là giá gói Pro 1 tháng.
//
// Dùng CHUNG cho cả lúc tạo đơn và lúc đối chiếu ở webhook — nếu hai chỗ khai
// riêng thì sửa giá một nơi sẽ khiến mọi giao dịch bị từ chối vì lệch số tiền.
//
// LƯU Ý khi đổi giá: đơn 'pending' tạo trước thời điểm đổi sẽ bị từ chối ở
// webhook vì khách trả theo giá cũ. Muốn đổi giá an toàn thì phải lưu số tiền
// theo từng đơn (thêm cột amount vào bảng subscription) thay vì dùng hằng số.
const ProPlanPriceVND int64 = 100000

var (
	// ErrOrderNotFound: orderId sai định dạng hoặc không có trong DB.
	// Không bao giờ tự khỏi -> đừng để MoMo gọi lại.
	ErrOrderNotFound = errors.New("không tìm thấy đơn hàng")

	// ErrAmountMismatch: chữ ký hợp lệ nhưng số tiền không khớp giá gói.
	ErrAmountMismatch = errors.New("số tiền thanh toán không khớp giá gói")
)

type PaymentService struct {
	subRepo     *repository.SubscriptionRepository
	momoService *MomoService
}

func NewPaymentService(subRepo *repository.SubscriptionRepository, momoService *MomoService) *PaymentService {
	return &PaymentService{
		subRepo:     subRepo,
		momoService: momoService,
	}
}

// 1. Tạo đơn hàng và lấy Link thanh toán MoMo
func (s *PaymentService) CreateProSubscription(userID uuid.UUID) (string, error) {
	amount := ProPlanPriceVND

	// Tạo bản ghi Subscription nháp (Pending)
	subID := uuid.New()

	// 👉 TẠO BIẾN TRUNG GIAN CHO THỜI GIAN HẾT HẠN
	expiredTime := time.Now().AddDate(0, 1, 0)

	subscription := &models.Subscription{
		SubscriptionID: subID,
		UserID:         userID,
		// plan_type là ENUM Postgres, chỉ nhận 'free' | 'pro'. Chu kỳ 1 tháng
		// được thể hiện bằng ExpiredAt chứ không nhét vào tên gói.
		PlanType:  models.PlanPro,
		Status:    models.SubPending,
		StartedAt: time.Now(),
		ExpiredAt: &expiredTime,
	}

	if err := s.subRepo.Create(subscription); err != nil {
		// Giữ lỗi gốc: nuốt nó đi thì lỗi enum/constraint của Postgres biến
		// thành "không thể tạo đơn hàng" vô nghĩa, không thể debug.
		log.Printf("[payment] tạo subscription thất bại (user=%s): %v", userID, err)
		return "", fmt.Errorf("không thể tạo đơn hàng: %w", err)
	}

	// Gọi sang MoMo Service để lấy Link thanh toán
	// Chúng ta dùng chính subID làm OrderID gửi cho MoMo
	momoResp, err := s.momoService.CreatePaymentURL(subID.String(), amount, "Nâng cấp gói Pro 1 Tháng")
	if err != nil {
		return "", err
	}

	return momoResp.PayUrl, nil
}

// 2. Xử lý khi MoMo gọi Webhook báo kết quả.
//
// Lỗi trả về được handler phân loại để quyết định có cho MoMo gọi lại hay không:
//   - ErrInvalidSignature / ErrAmountMismatch / ErrOrderNotFound: hỏng vĩnh viễn,
//     gọi lại vô ích.
//   - Lỗi khác (mất kết nối DB...): tạm thời, PHẢI để MoMo gọi lại.
func (s *PaymentService) ProcessMoMoWebhook(p *MomoIPNPayload) error {
	// BƯỚC 1 — Xác thực chữ ký TRƯỚC MỌI THỨ KHÁC.
	// Webhook là endpoint public. Không có bước này thì user chỉ cần tự gọi
	// /payment/upgrade lấy orderId rồi POST thẳng vào đây với resultCode=0 là
	// lên Pro miễn phí, không đồng nào đi qua MoMo.
	if err := s.momoService.VerifyIPNSignature(p); err != nil {
		log.Printf("[payment] TỪ CHỐI webhook chữ ký sai (orderId=%s): %v", p.OrderId, err)
		return err
	}

	// BƯỚC 2 — Tìm đơn hàng.
	subID, err := uuid.Parse(p.OrderId)
	if err != nil {
		return fmt.Errorf("%w: orderId %q không phải UUID", ErrOrderNotFound, p.OrderId)
	}

	subscription, err := s.subRepo.FindByID(subID)
	if errors.Is(err, repository.ErrNotFound) {
		return fmt.Errorf("%w: %s", ErrOrderNotFound, subID)
	}
	if err != nil {
		// Lỗi DB tạm thời -> trả lỗi trần để handler bảo MoMo gọi lại.
		log.Printf("[payment] lỗi đọc đơn %s: %v", subID, err)
		return fmt.Errorf("không thể đọc đơn hàng: %w", err)
	}

	// BƯỚC 3 — Idempotent. MoMo gọi lại webhook nhiều lần cho cùng một đơn.
	if subscription.Status == models.SubActive {
		return nil
	}

	// BƯỚC 4 — resultCode != 0: khách huỷ thanh toán hoặc giao dịch thất bại.
	if p.ResultCode != 0 {
		subscription.Status = models.SubCancelled
		if err := s.subRepo.Update(subscription); err != nil {
			log.Printf("[payment] huỷ đơn %s thất bại: %v", subID, err)
			return fmt.Errorf("không thể cập nhật đơn hàng: %w", err)
		}
		return nil
	}

	// BƯỚC 5 — Đối chiếu số tiền.
	// Chữ ký chỉ chứng minh "MoMo gửi cái này", KHÔNG chứng minh khách trả đủ.
	// Thiếu bước này thì một giao dịch 1.000đ hợp lệ vẫn mở khoá gói Pro.
	// Cố ý KHÔNG huỷ đơn: để nguyên 'pending' cho người vận hành đối soát tay.
	if p.Amount != ProPlanPriceVND {
		log.Printf("[payment] TỪ CHỐI đơn %s: trả %d đ nhưng giá gói là %d đ (transId=%d)",
			subID, p.Amount, ProPlanPriceVND, p.TransId)
		return fmt.Errorf("%w: nhận %d đ, cần %d đ", ErrAmountMismatch, p.Amount, ProPlanPriceVND)
	}

	// BƯỚC 6 — Kích hoạt đơn + nâng gói user trong MỘT transaction.
	//
	// Quyền gói nằm ở cột app_user.plan_type, KHÔNG phải role: enum user_role
	// chỉ có super_admin|admin|user, gán role='pro' sẽ lỗi enum và khách trả
	// tiền xong vẫn không lên được Pro.
	paymentRef := strconv.FormatInt(p.TransId, 10)
	if err := s.subRepo.ActivateAndUpgradeUser(subID, subscription.UserID, paymentRef); err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return fmt.Errorf("%w: đơn %s hoặc user %s đã bị xoá", ErrOrderNotFound, subID, subscription.UserID)
		}
		log.Printf("[payment] kích hoạt đơn %s thất bại, đã rollback: %v", subID, err)
		return fmt.Errorf("không thể nâng cấp tài khoản: %w", err)
	}

	log.Printf("[payment] đã nâng cấp user %s lên Pro (đơn %s, transId %d)",
		subscription.UserID, subID, p.TransId)
	return nil
}
