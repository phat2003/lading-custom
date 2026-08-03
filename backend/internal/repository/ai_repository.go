package repository

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"

	"github.com/nhienthai/lading-custom/backend/internal/models"
)

// AIRepository truy vấn lịch sử tạo bằng AI và hạn mức theo user.
type AIRepository struct {
	db *gorm.DB
}

func NewAIRepository(db *gorm.DB) *AIRepository {
	return &AIRepository{db: db}
}

// CreateGeneration ghi 1 lượt tạo mới.
func (r *AIRepository) CreateGeneration(g *models.AIGeneration) error {
	return r.db.Create(g).Error
}

// UpdateGeneration lưu thay đổi (đổi status, gắn kết quả, ghi lỗi...).
func (r *AIRepository) UpdateGeneration(g *models.AIGeneration) error {
	return r.db.Save(g).Error
}

// FindGenerationsByUser trả lịch sử của 1 user, mới nhất trước, kèm tổng số dòng.
func (r *AIRepository) FindGenerationsByUser(userID uuid.UUID, page, limit int) ([]models.AIGeneration, int64, error) {
	query := r.db.Model(&models.AIGeneration{}).Where("user_id = ?", userID)

	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Khởi tạo non-nil để JSON trả [] thay vì null khi chưa có lượt nào.
	items := []models.AIGeneration{}
	err := query.
		Order("created_at DESC").
		Limit(limit).
		Offset((page - 1) * limit).
		Find(&items).Error

	return items, total, err
}

// AILogRow là 1 dòng log toàn hệ thống, kèm thông tin người tạo.
// Read model cho Dashboard, không phải entity.
type AILogRow struct {
	GenerationID uuid.UUID                 `gorm:"column:generation_id"`
	Prompt       string                    `gorm:"column:prompt"`
	Status       models.AIGenerationStatus `gorm:"column:status"`
	CreatedAt    time.Time                 `gorm:"column:created_at"`
	UserID       uuid.UUID                 `gorm:"column:user_id"`
	FullName     string                    `gorm:"column:full_name"`
	Email        string                    `gorm:"column:email"`
}

// FindRecentLogs trả các lượt tạo gần nhất của TOÀN HỆ THỐNG (cho Dashboard).
func (r *AIRepository) FindRecentLogs(limit int) ([]AILogRow, error) {
	rows := []AILogRow{}
	err := r.db.Table("ai_generation AS g").
		Select("g.generation_id, g.prompt, g.status, g.created_at, u.user_id, u.full_name, u.email").
		Joins("JOIN app_user AS u ON u.user_id = g.user_id").
		Order("g.created_at DESC").
		Limit(limit).
		Scan(&rows).Error
	return rows, err
}

// CountGenerationsSince đếm số lượt tạo của toàn hệ thống từ mốc thời gian trở đi.
// Dùng để áp trần ai_daily_limit trong platform_setting.
func (r *AIRepository) CountGenerationsSince(since time.Time) (int64, error) {
	var total int64
	err := r.db.Model(&models.AIGeneration{}).Where("created_at >= ?", since).Count(&total).Error
	return total, err
}

// CountDoneGenerations đếm số lượt tạo đã hoàn thành (thẻ số liệu trên Dashboard).
func (r *AIRepository) CountDoneGenerations() (int64, error) {
	var total int64
	err := r.db.Model(&models.AIGeneration{}).Where("status = ?", models.AIDone).Count(&total).Error
	return total, err
}

// CountDoneGenerationsSince đếm số lượt hoàn thành từ mốc thời gian trở đi (delta).
func (r *AIRepository) CountDoneGenerationsSince(since time.Time) (int64, error) {
	var total int64
	err := r.db.Model(&models.AIGeneration{}).
		Where("status = ? AND created_at >= ?", models.AIDone, since).
		Count(&total).Error
	return total, err
}

// GetOrCreateCredit lấy hạn mức của user; chưa có thì tạo dòng mặc định.
// Tạo lười thay vì seed sẵn cho mọi user: đa số user không dùng AI, seed sẵn
// chỉ tạo ra hàng loạt dòng rỗng phải bảo trì.
func (r *AIRepository) GetOrCreateCredit(userID uuid.UUID) (*models.AICredit, error) {
	var credit models.AICredit
	err := r.db.First(&credit, "user_id = ?", userID).Error
	if err == nil {
		return &credit, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Giá trị mặc định khớp DEFAULT trong migration 007.
	credit = models.AICredit{
		UserID:  userID,
		Used:    0,
		Total:   1000,
		ResetAt: time.Now().AddDate(0, 0, 30),
	}
	if err := r.db.Create(&credit).Error; err != nil {
		return nil, err
	}
	return &credit, nil
}

// UpdateCredit lưu thay đổi hạn mức.
func (r *AIRepository) UpdateCredit(c *models.AICredit) error {
	return r.db.Save(c).Error
}
