package service

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"github.com/nhienthai/lading-custom/backend/internal/config"
)

// ErrInvalidSignature: body gửi tới webhook không do MoMo ký.
// Gọi lại bao nhiêu lần cũng sai -> handler không được để MoMo retry.
var ErrInvalidSignature = errors.New("chữ ký MoMo không hợp lệ")

type MomoService struct {
	config *config.Config
}

func NewMomoService(cfg *config.Config) *MomoService {
	return &MomoService{config: cfg}
}

// Struct gửi đi
type MomoCreateOrderRequest struct {
	PartnerCode string `json:"partnerCode"`
	PartnerName string `json:"partnerName"`
	StoreId     string `json:"storeId"`
	RequestId   string `json:"requestId"`
	Amount      int64  `json:"amount"`
	OrderId     string `json:"orderId"`
	OrderInfo   string `json:"orderInfo"`
	RedirectUrl string `json:"redirectUrl"`
	IpnUrl      string `json:"ipnUrl"`
	Lang        string `json:"lang"`
	ExtraData   string `json:"extraData"`
	RequestType string `json:"requestType"`
	Signature   string `json:"signature"`
}

// Struct nhận về
type MomoCreateOrderResponse struct {
	PayUrl     string `json:"payUrl"`
	ResultCode int    `json:"resultCode"`
	Message    string `json:"message"`
}

// CreatePaymentURL gọi API MoMo để lấy link thanh toán QR Code
func (s *MomoService) CreatePaymentURL(orderID string, amount int64, orderInfo string) (*MomoCreateOrderResponse, error) {
	endpoint := "https://test-payment.momo.vn/v2/gateway/api/create"
	requestType := "captureWallet"
	extraData := "" // Có thể truyền thêm dữ liệu ẩn nếu cần

	// 1. Tạo chuỗi dữ liệu gốc (Bắt buộc phải sắp xếp đúng thứ tự Alphabet)
	rawData := fmt.Sprintf("accessKey=%s&amount=%d&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
		s.config.MomoAccessKey, amount, extraData, s.config.MomoNotifyURL, orderID, orderInfo,
		s.config.MomoPartnerCode, s.config.MomoReturnURL, orderID, requestType)

	// 2. Ký chữ ký bảo mật bằng SecretKey
	signature := s.generateSignature(rawData, s.config.MomoSecretKey)

	// 3. Đóng gói Request
	reqPayload := MomoCreateOrderRequest{
		PartnerCode: s.config.MomoPartnerCode,
		PartnerName: "Landing Page Builder",
		StoreId:     s.config.MomoPartnerCode,
		RequestId:   orderID, // MoMo khuyến cáo dùng chung OrderID cho RequestID
		Amount:      amount,
		OrderId:     orderID,
		OrderInfo:   orderInfo,
		RedirectUrl: s.config.MomoReturnURL,
		IpnUrl:      s.config.MomoNotifyURL,
		Lang:        "vi",
		ExtraData:   extraData,
		RequestType: requestType,
		Signature:   signature,
	}

	jsonPayload, _ := json.Marshal(reqPayload)

	// 4. Gửi HTTP POST
	resp, err := http.Post(endpoint, "application/json", bytes.NewBuffer(jsonPayload))
	if err != nil {
		return nil, fmt.Errorf("lỗi kết nối MoMo: %v", err)
	}
	defer resp.Body.Close()

	// 5. Đọc kết quả
	var momoResp MomoCreateOrderResponse
	if err := json.NewDecoder(resp.Body).Decode(&momoResp); err != nil {
		return nil, fmt.Errorf("lỗi đọc dữ liệu MoMo: %v", err)
	}

	if momoResp.ResultCode != 0 {
		return nil, fmt.Errorf("momo báo lỗi (%d): %s", momoResp.ResultCode, momoResp.Message)
	}

	return &momoResp, nil
}

// MomoIPNPayload là body MoMo POST về webhook sau khi khách thanh toán.
//
// Phải khai báo ĐỦ mọi trường tham gia ký. Thiếu một trường thôi thì chuỗi raw
// dựng lại ở dưới sẽ khác chuỗi MoMo đã ký, và chữ ký hợp lệ cũng bị coi là sai.
type MomoIPNPayload struct {
	PartnerCode  string `json:"partnerCode"`
	OrderId      string `json:"orderId"`
	RequestId    string `json:"requestId"`
	Amount       int64  `json:"amount"`
	OrderInfo    string `json:"orderInfo"`
	OrderType    string `json:"orderType"`
	TransId      int64  `json:"transId"`
	ResultCode   int    `json:"resultCode"`
	Message      string `json:"message"`
	PayType      string `json:"payType"`
	ResponseTime int64  `json:"responseTime"`
	ExtraData    string `json:"extraData"`
	Signature    string `json:"signature"`
}

// VerifyIPNSignature xác thực body webhook thực sự do MoMo gửi.
//
// BẮT BUỘC gọi trước khi đụng vào database. Endpoint webhook là public (không
// token), nên nếu bỏ qua bước này thì bất kỳ ai cũng có thể POST
// {"orderId": "...", "resultCode": 0} để tự nâng mình lên Pro mà không trả đồng nào.
//
// Thứ tự trường trong chuỗi raw là theo alphabet và do MoMo quy định — KHÔNG
// được sắp xếp lại, kể cả khi nhìn có vẻ tuỳ tiện.
func (s *MomoService) VerifyIPNSignature(p *MomoIPNPayload) error {
	// Secret rỗng nghĩa là chưa cấu hình. Cứ ký tiếp thì attacker biết khoá rỗng
	// sẽ giả được chữ ký -> phải chặn hẳn thay vì âm thầm cho qua.
	if s.config.MomoSecretKey == "" || s.config.MomoAccessKey == "" {
		return fmt.Errorf("%w: chưa cấu hình MOMO_SECRET_KEY/MOMO_ACCESS_KEY", ErrInvalidSignature)
	}

	// Chặn merchant khác gọi nhầm (hoặc cố ý) vào webhook của mình.
	if p.PartnerCode != s.config.MomoPartnerCode {
		return fmt.Errorf("%w: partnerCode %q không phải của hệ thống", ErrInvalidSignature, p.PartnerCode)
	}

	rawData := fmt.Sprintf("accessKey=%s&amount=%d&extraData=%s&message=%s&orderId=%s&orderInfo=%s&orderType=%s&partnerCode=%s&payType=%s&requestId=%s&responseTime=%d&resultCode=%d&transId=%d",
		s.config.MomoAccessKey, p.Amount, p.ExtraData, p.Message, p.OrderId, p.OrderInfo,
		p.OrderType, p.PartnerCode, p.PayType, p.RequestId, p.ResponseTime, p.ResultCode, p.TransId)

	expected := s.generateSignature(rawData, s.config.MomoSecretKey)

	// hmac.Equal so sánh thời gian hằng số, tránh rò rỉ chữ ký qua timing attack.
	if !hmac.Equal([]byte(expected), []byte(p.Signature)) {
		return ErrInvalidSignature
	}
	return nil
}

// generateSignature mã hóa HMAC SHA256
func (s *MomoService) generateSignature(data string, secretKey string) string {
	h := hmac.New(sha256.New, []byte(secretKey))
	h.Write([]byte(data))
	return hex.EncodeToString(h.Sum(nil))
}
