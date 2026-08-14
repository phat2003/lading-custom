package models

import (
	"time"

	"github.com/google/uuid"
)

// Các kiểu enum khớp với ENUM type trong PostgreSQL.
type (
	UserRole           string
	PlanType           string
	SubscriptionStatus string
	TemplateType       string
	TemplateSource     string
	TemplateStatus     string
	TemplateTier       string
	LandingPageStatus  string
	AIGenerationStatus string
)

const (
	RoleSuperAdmin UserRole = "super_admin"
	RoleAdmin      UserRole = "admin"
	RoleUser       UserRole = "user"

	PlanFree PlanType = "free"
	PlanPro  PlanType = "pro"

	SubActive    SubscriptionStatus = "active"
	SubExpired   SubscriptionStatus = "expired"
	SubCancelled SubscriptionStatus = "cancelled"
	// SubPending: đơn đã tạo nhưng khách chưa trả tiền (migration 008).
	// Chưa được hưởng quyền Pro cho tới khi webhook xác nhận.
	SubPending SubscriptionStatus = "pending"

	TemplateSystem TemplateType = "system"
	TemplateUser   TemplateType = "user"

	SourceCreatedByAdmin       TemplateSource = "created_by_admin"
	SourceSavedFromLandingPage TemplateSource = "saved_from_landing_page"

	TemplateStatusDraft     TemplateStatus = "draft"
	TemplateStatusPublished TemplateStatus = "published"

	TierFree    TemplateTier = "free"
	TierPremium TemplateTier = "premium"

	StatusDraft     LandingPageStatus = "draft"
	StatusPublished LandingPageStatus = "published"

	AIGenerating AIGenerationStatus = "generating"
	AIDone       AIGenerationStatus = "done"
	AIFailed     AIGenerationStatus = "failed"
)

// User — bảng app_user. 1 user có nhiều project, là owner của user template.
type User struct {
	UserID       uuid.UUID `gorm:"column:user_id;type:uuid;default:gen_random_uuid();primaryKey" json:"user_id"`
	Email        string    `gorm:"column:email;uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"column:password_hash;not null" json:"-"` // không bao giờ trả ra JSON
	FullName     string    `gorm:"column:full_name" json:"full_name"`
	Role         UserRole  `gorm:"column:role;type:user_role;default:'user'" json:"role"`
	PlanType     PlanType  `gorm:"column:plan_type;type:plan_type;default:'free'" json:"plan_type"`

	// Field quản trị (migration 004).
	Phone string `gorm:"column:phone" json:"phone"`
	// IsActive: false = admin đã khoá tài khoản.
	// LƯU Ý: tag default khiến GORM bỏ qua giá trị false lúc INSERT (dùng default DB),
	// nên nơi nào tạo user phải set IsActive: true tường minh. Khi UPDATE bằng Save
	// thì mọi field đều được ghi, kể cả false -> thao tác khoá vẫn có tác dụng.
	IsActive       bool   `gorm:"column:is_active;default:true" json:"is_active"`
	Timezone       string `gorm:"column:timezone;default:'Asia/Ho_Chi_Minh'" json:"timezone"`
	SessionTimeout string `gorm:"column:session_timeout;default:'never'" json:"session_timeout"`

	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`

	Projects []Project `gorm:"foreignKey:OwnerID" json:"projects,omitempty"`
}

func (User) TableName() string { return "app_user" }

// Subscription — bảng subscription. Tách khỏi user để xử lý gia hạn/hết hạn.
type Subscription struct {
	SubscriptionID uuid.UUID          `gorm:"column:subscription_id;type:uuid;default:gen_random_uuid();primaryKey" json:"subscription_id"`
	UserID         uuid.UUID          `gorm:"column:user_id;type:uuid;not null" json:"user_id"`
	PlanType       PlanType           `gorm:"column:plan_type;type:plan_type;not null" json:"plan_type"`
	Status         SubscriptionStatus `gorm:"column:status;type:subscription_status;default:'active'" json:"status"`
	StartedAt      time.Time          `gorm:"column:started_at" json:"started_at"`
	ExpiredAt      *time.Time         `gorm:"column:expired_at" json:"expired_at,omitempty"`
	PaymentRef     string             `gorm:"column:payment_ref" json:"payment_ref,omitempty"`
	CreatedAt      time.Time          `gorm:"column:created_at" json:"created_at"`
}

func (Subscription) TableName() string { return "subscription" }
