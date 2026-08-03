package service

import (
	"time"

	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

// Khoảng thời gian tính delta cho thẻ số liệu trên Dashboard.
const statsDeltaWindow = 7 * 24 * time.Hour // "this week"

// StatMetric là 1 ô số liệu trên Dashboard.
// Delta = nil nghĩa là chỉ số này không có khái niệm "tăng/giảm theo kỳ"
// (FE sẽ hiển thị dòng mô tả tĩnh thay vì mũi tên).
type StatMetric struct {
	Value       int64  `json:"value"`
	Delta       *int64 `json:"delta"`
	DeltaPeriod string `json:"delta_period,omitempty"`
}

// DashboardStats là toàn bộ số liệu cho 4 thẻ đầu trang Admin Dashboard.
type DashboardStats struct {
	TotalUsers    StatMetric `json:"total_users"`
	TotalProjects StatMetric `json:"total_projects"`
	TotalSections StatMetric `json:"total_sections"`
	AIGenerated   StatMetric `json:"ai_generated"`
}

// StatsService tổng hợp số liệu cho Admin Dashboard.
type StatsService struct {
	statsRepo *repository.StatsRepository
	aiRepo    *repository.AIRepository
}

func NewStatsService(statsRepo *repository.StatsRepository, aiRepo *repository.AIRepository) *StatsService {
	return &StatsService{statsRepo: statsRepo, aiRepo: aiRepo}
}

// GetDashboardStats chạy các câu đếm và gói lại thành 4 thẻ số liệu.
func (s *StatsService) GetDashboardStats() (*DashboardStats, error) {
	since := time.Now().Add(-statsDeltaWindow)

	totalUsers, err := s.statsRepo.CountUsers()
	if err != nil {
		return nil, err
	}
	newUsers, err := s.statsRepo.CountUsersSince(since)
	if err != nil {
		return nil, err
	}

	totalProjects, err := s.statsRepo.CountProjects()
	if err != nil {
		return nil, err
	}
	newProjects, err := s.statsRepo.CountProjectsSince(since)
	if err != nil {
		return nil, err
	}

	totalSections, err := s.statsRepo.CountSectionTemplates()
	if err != nil {
		return nil, err
	}

	// AI dùng mốc 1 tháng (khác 1 tuần của user/project) cho khớp nhãn
	// "this month" mà thẻ số liệu trên Dashboard đang hiển thị.
	aiGenerated, err := s.aiRepo.CountDoneGenerations()
	if err != nil {
		return nil, err
	}
	newAI, err := s.aiRepo.CountDoneGenerationsSince(time.Now().AddDate(0, -1, 0))
	if err != nil {
		return nil, err
	}

	return &DashboardStats{
		TotalUsers:    StatMetric{Value: totalUsers, Delta: &newUsers, DeltaPeriod: "week"},
		TotalProjects: StatMetric{Value: totalProjects, Delta: &newProjects, DeltaPeriod: "week"},
		// Thư viện section không có khái niệm tăng theo tuần -> không có delta.
		TotalSections: StatMetric{Value: totalSections},
		AIGenerated:   StatMetric{Value: aiGenerated, Delta: &newAI, DeltaPeriod: "month"},
	}, nil
}
