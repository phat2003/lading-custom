package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/pkg/response"
)

// Claims là payload trong JWT token.
type Claims struct {
	UserID uuid.UUID       `json:"user_id"`
	Role   models.UserRole `json:"role"`
	jwt.RegisteredClaims
}

// GenerateToken tạo JWT cho user sau khi đăng nhập thành công.
func GenerateToken(secret string, expireHours int, userID uuid.UUID, role models.UserRole) (string, error) {
	claims := Claims{
		UserID: userID,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(expireHours) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// AuthRequired kiểm tra JWT trong header Authorization: Bearer <token>.
func AuthRequired(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			response.Fail(c, http.StatusUnauthorized, "thiếu hoặc sai định dạng token")
			c.Abort()
			return
		}

		tokenStr := strings.TrimPrefix(header, "Bearer ")
		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
			return []byte(secret), nil
		})
		if err != nil || !token.Valid {
			response.Fail(c, http.StatusUnauthorized, "token không hợp lệ hoặc đã hết hạn")
			c.Abort()
			return
		}

		// Lưu thông tin user vào context để handler dùng.
		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)
		c.Next()
	}
}

// AdminRequired chỉ cho phép admin hoặc super_admin (dùng sau AuthRequired).
func AdminRequired() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			response.Fail(c, http.StatusForbidden, "không xác định được quyền")
			c.Abort()
			return
		}
		r := role.(models.UserRole)
		if r != models.RoleAdmin && r != models.RoleSuperAdmin {
			response.Fail(c, http.StatusForbidden, "chỉ admin mới được phép thực hiện")
			c.Abort()
			return
		}
		c.Next()
	}
}

