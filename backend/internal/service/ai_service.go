package service

import (
	"errors"
	"time"

	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

// Lỗi nghiệp vụ của AI Generator.
var (
	ErrAIDisabled          = errors.New("tính năng AI đang tắt")
	ErrAIDailyLimitReached = errors.New("hệ thống đã đạt giới hạn tạo trong ngày")
	ErrAICreditExhausted   = errors.New("bạn đã dùng hết hạn mức AI")
)

// creditResetPeriod — chu kỳ reset hạn mức của mỗi user.
const creditResetPeriod = 30 * 24 * time.Hour

// stubErrorMessage — lý do ghi vào mọi lượt tạo khi CHƯA tích hợp mô hình AI.
// Xoá hằng này cùng lúc với việc cắm mô hình thật vào Generate.
const stubErrorMessage = "chưa tích hợp mô hình AI — hệ thống chưa sinh được thiết kế"

// AIService xử lý luồng tạo thiết kế bằng AI.
type AIService struct {
	aiRepo      *repository.AIRepository
	settingRepo *repository.PlatformSettingRepository
}

func NewAIService(
	aiRepo *repository.AIRepository,
	settingRepo *repository.PlatformSettingRepository,
) *AIService {
	return &AIService{aiRepo: aiRepo, settingRepo: settingRepo}
}

// GenerateInput dữ liệu đầu vào một lượt tạo.
type GenerateInput struct {
	Prompt       string
	TemplateType string
	Style        string
}

// Generate tạo một lượt sinh thiết kế bằng AI.
//
// ========================= CHƯA TÍCH HỢP MÔ HÌNH =========================
// Hàm này KHÔNG gọi mô hình AI nào. Toàn bộ phần xung quanh đã thật —
// kiểm tra công tắc AI, trần theo ngày, ghi lịch sử, quản lý hạn mức — nhưng
// bước sinh nội dung chỉ là chỗ giữ chỗ.
//
// Vì chưa sinh được gì, mọi lượt tạo kết thúc ở trạng thái 'failed' kèm lý do
// rõ ràng, và KHÔNG trừ hạn mức của user. Cố tình không đánh 'done': đánh
// thành công cho một lượt không tạo ra thiết kế nào là nói dối người dùng,
// và còn làm sai luôn thẻ "AI Generated Pages" trên Dashboard.
//
// Khi tích hợp thật, sửa đúng khối đánh dấu bên dưới:
//   - gọi API mô hình (nên chạy bất đồng bộ, để status là 'generating')
//   - sinh template + template_section, gán ResultTemplateID
//   - đặt Status = AIDone và ghi TokensUsed thật khi xong
//
// Phần trừ hạn mức bên dưới đã viết sẵn theo đúng logic cuối cùng
// (chỉ trừ khi 'done'), nên không phải sửa gì thêm.
// =========================================================================
func (s *AIService) Generate(userID uuid.UUID, in GenerateInput) (*models.AIGeneration, error) {
	setting, err := s.settingRepo.Get()
	if err != nil {
		return nil, err
	}
	if !setting.AIEnabled {
		return nil, ErrAIDisabled
	}

	// Trần toàn hệ thống theo ngày, lấy từ cấu hình ở trang Settings.
	if setting.AIDailyLimit > 0 {
		todayCount, err := s.aiRepo.CountGenerationsSince(startOfToday())
		if err != nil {
			return nil, err
		}
		if todayCount >= int64(setting.AIDailyLimit) {
			return nil, ErrAIDailyLimitReached
		}
	}

	credit, err := s.creditWithReset(userID)
	if err != nil {
		return nil, err
	}
	if credit.Used >= credit.Total {
		return nil, ErrAICreditExhausted
	}

	generation := &models.AIGeneration{
		UserID:       userID,
		Prompt:       in.Prompt,
		TemplateType: in.TemplateType,
		Style:        in.Style,
		Status:       models.AIGenerating,
	}
	if err := s.aiRepo.CreateGeneration(generation); err != nil {
		return nil, err
	}

	// ---------------- CHỖ CẮM MÔ HÌNH AI (chưa tích hợp) ----------------
	now := time.Now()
	generation.Status = models.AIFailed
	generation.ErrorMessage = stubErrorMessage
	generation.TokensUsed = 0
	generation.CompletedAt = &now
	// ---------------------------------------------------------------------

	if err := s.aiRepo.UpdateGeneration(generation); err != nil {
		return nil, err
	}

	// Chỉ trừ hạn mức khi lượt tạo thành công — thất bại thì không tính phí.
	if generation.Status == models.AIDone {
		credit.Used++
		if err := s.aiRepo.UpdateCredit(credit); err != nil {
			return nil, err
		}
	}

	return generation, nil
}

// GetHistory trả lịch sử tạo của chính user, kèm tổng số dòng.
func (s *AIService) GetHistory(userID uuid.UUID, page, limit int) ([]models.AIGeneration, int64, error) {
	return s.aiRepo.FindGenerationsByUser(userID, page, limit)
}

// GetCredits trả hạn mức hiện tại của user (tự reset nếu đã qua kỳ).
func (s *AIService) GetCredits(userID uuid.UUID) (*models.AICredit, error) {
	return s.creditWithReset(userID)
}

// AILogUser — thông tin người tạo đi kèm log.
type AILogUser struct {
	UserID   uuid.UUID `json:"user_id"`
	FullName string    `json:"full_name"`
	Email    string    `json:"email"`
}

// AILog — 1 dòng log AI toàn hệ thống cho Dashboard.
type AILog struct {
	GenerationID uuid.UUID                 `json:"generation_id"`
	Prompt       string                    `json:"prompt"`
	Status       models.AIGenerationStatus `json:"status"`
	User         AILogUser                 `json:"user"`
	CreatedAt    time.Time                 `json:"created_at"`
}

// GetAdminLogs trả các lượt tạo gần nhất của toàn hệ thống.
func (s *AIService) GetAdminLogs(limit int) ([]AILog, error) {
	rows, err := s.aiRepo.FindRecentLogs(limit)
	if err != nil {
		return nil, err
	}

	logs := make([]AILog, 0, len(rows))
	for _, r := range rows {
		logs = append(logs, AILog{
			GenerationID: r.GenerationID,
			Prompt:       r.Prompt,
			Status:       r.Status,
			User:         AILogUser{UserID: r.UserID, FullName: r.FullName, Email: r.Email},
			CreatedAt:    r.CreatedAt,
		})
	}
	return logs, nil
}

// creditWithReset lấy hạn mức và reset nếu đã qua mốc reset_at.
// Reset lười (kiểm tra lúc đọc) thay vì chạy cron: không cần thêm hạ tầng,
// và hạn mức chỉ có ý nghĩa tại đúng thời điểm user dùng.
func (s *AIService) creditWithReset(userID uuid.UUID) (*models.AICredit, error) {
	credit, err := s.aiRepo.GetOrCreateCredit(userID)
	if err != nil {
		return nil, err
	}

	if time.Now().After(credit.ResetAt) {
		credit.Used = 0
		credit.ResetAt = time.Now().Add(creditResetPeriod)
		if err := s.aiRepo.UpdateCredit(credit); err != nil {
			return nil, err
		}
	}
	return credit, nil
}

// startOfToday trả 00:00 hôm nay theo giờ máy chủ.
func startOfToday() time.Time {
	now := time.Now()
	return time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
}
