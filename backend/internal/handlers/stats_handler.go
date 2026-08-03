package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

// StatsHandler xử lý request số liệu tổng quan cho Admin Dashboard.
type StatsHandler struct {
	statsService *service.StatsService
}

func NewStatsHandler(statsService *service.StatsService) *StatsHandler {
	return &StatsHandler{statsService: statsService}
}

// GetDashboardStats godoc — GET /api/v1/admin/stats
func (h *StatsHandler) GetDashboardStats(c *gin.Context) {
	stats, err := h.statsService.GetDashboardStats()
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, "lấy số liệu thống kê thất bại")
		return
	}

	response.OK(c, http.StatusOK, "lấy số liệu thành công", stats)
}
