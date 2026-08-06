package middleware

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

// RateLimiter đếm số request theo IP trong một cửa sổ thời gian cố định.
//
// PHẠM VI: bộ đếm nằm trong RAM của tiến trình, nên khi chạy nhiều instance thì
// hạn mức là "mỗi instance" chứ không phải toàn hệ thống. Đủ để chặn dò mật khẩu
// bằng script; nếu sau này scale ngang thì phải chuyển bộ đếm sang Redis.
type RateLimiter struct {
	mu      sync.Mutex
	hits    map[string]*window
	limit   int
	window  time.Duration
	lastGC  time.Time
	gcEvery time.Duration
}

type window struct {
	count   int
	resetAt time.Time
}

// NewRateLimiter tạo bộ đếm cho phép tối đa limit request mỗi window cho 1 IP.
func NewRateLimiter(limit int, per time.Duration) *RateLimiter {
	return &RateLimiter{
		hits:    make(map[string]*window),
		limit:   limit,
		window:  per,
		lastGC:  time.Now(),
		gcEvery: per * 10, // dọn thưa hơn cửa sổ đếm để khỏi tốn CPU vô ích
	}
}

// allow ghi nhận 1 lượt cho key và cho biết còn trong hạn mức hay không.
func (rl *RateLimiter) allow(key string, now time.Time) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	rl.collectExpired(now)

	w, ok := rl.hits[key]
	if !ok || now.After(w.resetAt) {
		rl.hits[key] = &window{count: 1, resetAt: now.Add(rl.window)}
		return true
	}

	w.count++
	return w.count <= rl.limit
}

// collectExpired xoá các bản ghi đã hết hạn. Không có bước này thì map phình
// mãi theo số IP từng gọi API — một dạng rò rỉ bộ nhớ chậm.
// Người gọi phải đang giữ rl.mu.
func (rl *RateLimiter) collectExpired(now time.Time) {
	if now.Sub(rl.lastGC) < rl.gcEvery {
		return
	}
	for k, w := range rl.hits {
		if now.After(w.resetAt) {
			delete(rl.hits, k)
		}
	}
	rl.lastGC = now
}

// Middleware chặn request vượt hạn mức bằng 429.
// Dùng cho các endpoint công khai tốn kém hoặc nhạy cảm (đăng nhập, đăng ký).
func (rl *RateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// ClientIP() đã tôn trọng X-Forwarded-For theo cấu hình TrustedProxies
		// của Gin. Nếu deploy sau proxy, nhớ set trusted proxies cho đúng, không
		// thì mọi request sẽ dùng chung IP của proxy và bị tính gộp hạn mức.
		if !rl.allow(c.ClientIP(), time.Now()) {
			response.Fail(c, http.StatusTooManyRequests,
				"bạn thao tác quá nhanh, vui lòng thử lại sau ít phút")
			c.Abort()
			return
		}
		c.Next()
	}
}
