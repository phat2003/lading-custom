package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/service"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

type PaymentHandler struct {
	paymentService *service.PaymentService
}

func NewPaymentHandler(paymentService *service.PaymentService) *PaymentHandler {
	return &PaymentHandler{paymentService: paymentService}
}

// API dành cho User: Bấm nút "Nâng cấp"
// POST /payment/upgrade
func (h *PaymentHandler) UpgradeToPro(c *gin.Context) {
	userIDVal, _ := c.Get("user_id")
	userID := userIDVal.(uuid.UUID)

	payUrl, err := h.paymentService.CreateProSubscription(userID)
	if err != nil {
		response.Fail(c, http.StatusInternalServerError, err.Error())
		return
	}

	response.OK(c, http.StatusOK, "Tạo link thanh toán thành công", gin.H{
		"pay_url": payUrl,
	})
}

// API dành cho MoMo: Webhook nhận thông báo tự động (KHÔNG yêu cầu Token)
// POST /p/payment/webhook
//
// QUY TẮC TRẢ MÃ HTTP — đây là phần quyết định tiền của khách có mất hay không:
//
//	204 No Content : đã xử lý xong, MoMo ngừng gọi lại (quy định của MoMo).
//	4xx            : body hỏng vĩnh viễn (sai chữ ký, sai số tiền, không có đơn).
//	                 Gọi lại cũng vẫn sai nên chặn luôn, đỡ tốn tài nguyên.
//	5xx            : lỗi TẠM THỜI (mất kết nối DB...). Bắt buộc phải trả 5xx để
//	                 MoMo gọi lại. Nếu trả 204 ở đây thì MoMo coi như xong, mà
//	                 khách thì đã trả tiền và mắc kẹt ở gói free vĩnh viễn,
//	                 không có cơ chế nào tự phục hồi.
func (h *PaymentHandler) MoMoWebhook(c *gin.Context) {
	// Bind vào đúng struct của tầng service: struct đó khai báo đủ mọi trường
	// tham gia ký, thiếu một trường là chữ ký tính ra sai.
	var req service.MomoIPNPayload
	if err := c.ShouldBindJSON(&req); err != nil {
		// JSON hỏng thì gọi lại bao nhiêu lần cũng hỏng.
		c.Status(http.StatusBadRequest)
		return
	}

	err := h.paymentService.ProcessMoMoWebhook(&req)
	switch {
	case err == nil:
		c.Status(http.StatusNoContent)
	case errors.Is(err, service.ErrInvalidSignature), errors.Is(err, service.ErrAmountMismatch):
		c.Status(http.StatusBadRequest)
	case errors.Is(err, service.ErrOrderNotFound):
		c.Status(http.StatusNotFound)
	default:
		c.Status(http.StatusInternalServerError)
	}
}
