package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

// Project — 1 project có nhiều landing page, thuộc 1 user.
type Project struct {
	ProjectID uuid.UUID `gorm:"column:project_id;type:uuid;default:gen_random_uuid();primaryKey" json:"project_id"`
	Name      string    `gorm:"column:name;not null" json:"name"`
	OwnerID   uuid.UUID `gorm:"column:owner_id;type:uuid;not null" json:"owner_id"`
	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`

	LandingPages []LandingPage `gorm:"foreignKey:ProjectID" json:"landing_pages,omitempty"`
}

func (Project) TableName() string { return "project" }

// SectionTemplateLibrary — thư viện section mẫu toàn cục do admin quản lý.
type SectionTemplateLibrary struct {
	SectionTemplateID uuid.UUID      `gorm:"column:section_template_id;type:uuid;default:gen_random_uuid();primaryKey" json:"section_template_id"`
	SectionType       string         `gorm:"column:section_type;not null" json:"section_type"`
	DisplayName       string         `gorm:"column:display_name;not null" json:"display_name"`
	DefaultContent    datatypes.JSON `gorm:"column:default_content;type:jsonb;not null" json:"default_content"`
	ThumbnailURL      string         `gorm:"column:thumbnail_url" json:"thumbnail_url,omitempty"`
	CreatedBy         *uuid.UUID     `gorm:"column:created_by;type:uuid" json:"created_by,omitempty"`
	CreatedAt         time.Time      `gorm:"column:created_at" json:"created_at"`

	// UsedIn không phải cột DB — đếm số template đang dùng mẫu này qua
	// template_section.source_section_template_id, gán ở tầng service.
	UsedIn int64 `gorm:"-" json:"used_in"`
}

func (SectionTemplateLibrary) TableName() string { return "section_template_library" }

// Template — system (admin) hoặc user (lưu từ landing page).
type Template struct {
	TemplateID     uuid.UUID      `gorm:"column:template_id;type:uuid;default:gen_random_uuid();primaryKey" json:"template_id"`
	Name           string         `gorm:"column:name;not null" json:"name"`
	Type           TemplateType   `gorm:"column:type;type:template_type;not null" json:"type"`
	OwnerID        *uuid.UUID     `gorm:"column:owner_id;type:uuid" json:"owner_id,omitempty"` // null nếu system
	TemplateSource TemplateSource `gorm:"column:template_source;type:template_source;not null" json:"template_source"`

	// Metadata cho trang admin Templates (migration 003).
	Category     string         `gorm:"column:category" json:"category"`
	Status       TemplateStatus `gorm:"column:status;type:template_status;default:'draft'" json:"status"`
	Tier         TemplateTier   `gorm:"column:tier;type:template_tier;default:'free'" json:"tier"`
	ThumbnailURL string         `gorm:"column:thumbnail_url" json:"thumbnail_url"`

	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`

	// SectionCount không phải cột DB — đếm từ template_section rồi gán ở tầng
	// service, để danh sách không phải preload toàn bộ nội dung section.
	SectionCount int64 `gorm:"-" json:"section_count"`

	Sections []TemplateSection `gorm:"foreignKey:TemplateID" json:"sections,omitempty"`
}

func (Template) TableName() string { return "template" }

// TemplateSection — section thuộc về 1 template cụ thể.
type TemplateSection struct {
	SectionID               uuid.UUID      `gorm:"column:section_id;type:uuid;default:gen_random_uuid();primaryKey" json:"section_id"`
	TemplateID              uuid.UUID      `gorm:"column:template_id;type:uuid;not null" json:"template_id"`
	SectionType             string         `gorm:"column:section_type;not null" json:"section_type"`
	SectionContent          datatypes.JSON `gorm:"column:section_content;type:jsonb;not null" json:"section_content"`
	OrderIndex              int            `gorm:"column:order_index;default:0" json:"order_index"`
	SourceSectionTemplateID *uuid.UUID     `gorm:"column:source_section_template_id;type:uuid" json:"source_section_template_id,omitempty"`
	CreatedAt               time.Time      `gorm:"column:created_at" json:"created_at"`
}

func (TemplateSection) TableName() string { return "template_section" }

// LandingPage — thuộc 1 project; tạo từ template hoặc blank.
type LandingPage struct {
	LandingPageID    uuid.UUID         `gorm:"column:landing_page_id;type:uuid;default:gen_random_uuid();primaryKey" json:"landing_page_id"`
	ProjectID        uuid.UUID         `gorm:"column:project_id;type:uuid;not null" json:"project_id"`
	Name             string            `gorm:"column:name;not null" json:"name"`
	SourceTemplateID *uuid.UUID        `gorm:"column:source_template_id;type:uuid" json:"source_template_id,omitempty"` // null nếu blank
	Status           LandingPageStatus `gorm:"column:status;type:landing_page_status;default:'draft'" json:"status"`
	// PublishedURL — slug công khai của trang (/p/:slug). Null nếu chưa từng publish.
	// Slug thuộc về TRANG (không thuộc snapshot) nên bền qua mọi lần republish và cả
	// chu kỳ unpublish -> publish lại. Xem migration 002_move_slug_to_page.
	PublishedURL *string `gorm:"column:published_url;uniqueIndex" json:"published_url,omitempty"`
	// SEOSettings là metadata riêng của từng Landing Page. JSONB giữ contract gọn,
	// tương thích ngược với các trang cũ qua default object rỗng.
	SEOSettings datatypes.JSON `gorm:"column:seo_settings;type:jsonb;not null;default:'{}'" json:"seo_settings"`
	CreatedAt   time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"column:updated_at" json:"updated_at"`

	Sections []PageSection `gorm:"foreignKey:LandingPageID" json:"sections,omitempty"`
}

// LandingPageSEO là contract SEO tối thiểu được User Builder và renderer công khai dùng chung.
type LandingPageSEO struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Keywords    string `json:"keywords"`
	OGImage     string `json:"og_image"`
	Favicon     string `json:"favicon"`
}

// SEO trả metadata đã parse; JSON cũ/hỏng rơi về giá trị rỗng thay vì làm hỏng trang.
func (p *LandingPage) SEO() LandingPageSEO {
	var seo LandingPageSEO
	if p == nil || len(p.SEOSettings) == 0 {
		return seo
	}
	_ = json.Unmarshal(p.SEOSettings, &seo)
	return seo
}

func (LandingPage) TableName() string { return "landing_page" }

// PageSection — nội dung thực tế user đã sửa. Độc lập với TemplateSection.
type PageSection struct {
	SectionID     uuid.UUID      `gorm:"column:section_id;type:uuid;default:gen_random_uuid();primaryKey" json:"section_id"`
	LandingPageID uuid.UUID      `gorm:"column:landing_page_id;type:uuid;not null" json:"landing_page_id"`
	SectionType   string         `gorm:"column:section_type;not null" json:"section_type"`
	Content       datatypes.JSON `gorm:"column:content;type:jsonb;not null" json:"content"`
	OrderIndex    int            `gorm:"column:order_index;default:0" json:"order_index"`
	IsVisible     bool           `gorm:"column:is_visible;default:true" json:"is_visible"`
	CreatedAt     time.Time      `gorm:"column:created_at" json:"created_at"`
	UpdatedAt     time.Time      `gorm:"column:updated_at" json:"updated_at"`
}

func (PageSection) TableName() string { return "page_section" }

// MediaAsset — ảnh/media, có thể gắn landing page hoặc upload độc lập.
type MediaAsset struct {
	AssetID       uuid.UUID  `gorm:"column:asset_id;type:uuid;default:gen_random_uuid();primaryKey" json:"asset_id"`
	OwnerID       uuid.UUID  `gorm:"column:owner_id;type:uuid;not null" json:"owner_id"`
	LandingPageID *uuid.UUID `gorm:"column:landing_page_id;type:uuid" json:"landing_page_id,omitempty"`
	FileURL       string     `gorm:"column:file_url;not null" json:"file_url"`
	FileType      string     `gorm:"column:file_type;not null" json:"file_type"`
	FileSize      int64      `gorm:"column:file_size" json:"file_size"`
	CreatedAt     time.Time  `gorm:"column:created_at" json:"created_at"`
}

func (MediaAsset) TableName() string { return "media_asset" }

// PublishedSnapshot — bản chụp nội dung tại thời điểm publish (bản ghi LỊCH SỬ).
// Mỗi lần publish tạo thêm 1 hàng; nhiều snapshot cùng 1 page là bình thường.
// Slug công khai KHÔNG nằm ở đây nữa mà ở landing_page.published_url (migration 002).
type PublishedSnapshot struct {
	SnapshotID      uuid.UUID      `gorm:"column:snapshot_id;type:uuid;default:gen_random_uuid();primaryKey" json:"snapshot_id"`
	LandingPageID   uuid.UUID      `gorm:"column:landing_page_id;type:uuid;not null" json:"landing_page_id"`
	SnapshotContent datatypes.JSON `gorm:"column:snapshot_content;type:jsonb;not null" json:"snapshot_content"`
	PublishedBy     *uuid.UUID     `gorm:"column:published_by;type:uuid" json:"published_by,omitempty"`
	PublishedAt     time.Time      `gorm:"column:published_at" json:"published_at"`
}

func (PublishedSnapshot) TableName() string { return "published_snapshot" }

// PlatformSetting — cấu hình hệ thống, CHỈ có đúng 1 dòng cho toàn hệ thống
// (ràng buộc bằng unique index trên cột is_singleton, xem migration 005).
type PlatformSetting struct {
	SettingID    uuid.UUID `gorm:"column:setting_id;type:uuid;default:gen_random_uuid();primaryKey" json:"setting_id"`
	PlatformName string    `gorm:"column:platform_name" json:"platform_name"`
	LogoURL      string    `gorm:"column:logo_url" json:"logo_url"`

	// Nhóm AI Engine. AIEnabled không đặt tag default vì cần ghi được giá trị
	// false khi admin tắt AI (xem ghi chú tương tự ở User.IsActive).
	AIEnabled         bool   `gorm:"column:ai_enabled" json:"ai_enabled"`
	AIDailyLimit      int    `gorm:"column:ai_daily_limit" json:"ai_daily_limit"`
	AIDefaultModel    string `gorm:"column:ai_default_model" json:"ai_default_model"`
	AIConcurrentLimit int    `gorm:"column:ai_concurrent_limit" json:"ai_concurrent_limit"`

	UpdatedBy *uuid.UUID `gorm:"column:updated_by;type:uuid" json:"updated_by,omitempty"`
	UpdatedAt time.Time  `gorm:"column:updated_at" json:"updated_at"`

	// IsSingleton là cột kỹ thuật phục vụ ràng buộc "chỉ 1 dòng", luôn true.
	IsSingleton bool `gorm:"column:is_singleton;default:true" json:"-"`
}

func (PlatformSetting) TableName() string { return "platform_setting" }

// PricingPlan — 1 gói trong bảng giá hiển thị.
//
// Code là VARCHAR độc lập với ENUM plan_type: bảng này lo phần hiển thị
// (giá, tính năng, thứ tự), còn user thuộc gói nào vẫn do app_user.plan_type
// quyết định. Xem migration 006.
type PricingPlan struct {
	PlanID uuid.UUID `gorm:"column:plan_id;type:uuid;default:gen_random_uuid();primaryKey" json:"plan_id"`
	Code   string    `gorm:"column:code;uniqueIndex;not null" json:"code"`
	Name   string    `gorm:"column:name;not null" json:"name"`
	Label  string    `gorm:"column:label" json:"label"`
	Price  int64     `gorm:"column:price" json:"price"` // VNĐ, số nguyên
	Unit   string    `gorm:"column:unit" json:"unit"`
	// Highlighted/IsActive không đặt tag default: GORM sẽ bỏ qua giá trị false
	// lúc INSERT nếu có default, khiến thao tác tắt/ẩn gói không có tác dụng.
	// Đổi lại, nơi tạo gói phải set IsActive tường minh.
	Highlighted bool   `gorm:"column:highlighted" json:"highlighted"`
	Badge       string `gorm:"column:badge" json:"badge"`
	SortOrder   int    `gorm:"column:sort_order" json:"sort_order"`
	IsActive    bool   `gorm:"column:is_active" json:"is_active"`

	CreatedAt time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt time.Time `gorm:"column:updated_at" json:"updated_at"`

	Features []PlanFeature `gorm:"foreignKey:PlanID" json:"features"`
}

func (PricingPlan) TableName() string { return "pricing_plan" }

// PlanFeature — 1 dòng tính năng thuộc về 1 gói.
type PlanFeature struct {
	FeatureID uuid.UUID `gorm:"column:feature_id;type:uuid;default:gen_random_uuid();primaryKey" json:"feature_id"`
	PlanID    uuid.UUID `gorm:"column:plan_id;type:uuid;not null" json:"plan_id"`
	Label     string    `gorm:"column:label;not null" json:"label"`
	// Included = false nghĩa là gói KHÔNG có tính năng này (hiện dấu ✕).
	// Không đặt tag default vì cần ghi được giá trị false.
	Included  bool `gorm:"column:included" json:"included"`
	SortOrder int  `gorm:"column:sort_order" json:"sort_order"`
}

func (PlanFeature) TableName() string { return "plan_feature" }

// AIGeneration — một lượt tạo thiết kế bằng AI (bản ghi lịch sử).
// Xem migration 007.
type AIGeneration struct {
	GenerationID uuid.UUID          `gorm:"column:generation_id;type:uuid;default:gen_random_uuid();primaryKey" json:"generation_id"`
	UserID       uuid.UUID          `gorm:"column:user_id;type:uuid;not null" json:"user_id"`
	Prompt       string             `gorm:"column:prompt;not null" json:"prompt"`
	TemplateType string             `gorm:"column:template_type" json:"template_type"`
	Style        string             `gorm:"column:style" json:"style"`
	Status       AIGenerationStatus `gorm:"column:status;type:ai_generation_status;default:'generating'" json:"status"`
	TokensUsed   int                `gorm:"column:tokens_used" json:"tokens_used"`
	ErrorMessage string             `gorm:"column:error_message" json:"error_message,omitempty"`
	// Template sinh ra được (nil nếu lượt tạo chưa xong hoặc thất bại).
	ResultTemplateID *uuid.UUID `gorm:"column:result_template_id;type:uuid" json:"result_template_id,omitempty"`
	CreatedAt        time.Time  `gorm:"column:created_at" json:"created_at"`
	CompletedAt      *time.Time `gorm:"column:completed_at" json:"completed_at,omitempty"`
}

func (AIGeneration) TableName() string { return "ai_generation" }

// AICredit — hạn mức AI của 1 user. Dòng được tạo lười khi user dùng AI lần đầu.
type AICredit struct {
	UserID uuid.UUID `gorm:"column:user_id;type:uuid;primaryKey" json:"user_id"`
	Used   int       `gorm:"column:used" json:"used"`
	Total  int       `gorm:"column:total" json:"total"`
	// ResetAt — mốc reset hạn mức. Qua mốc này, used về 0 ở lần dùng kế tiếp.
	ResetAt time.Time `gorm:"column:reset_at" json:"reset_at"`
}

func (AICredit) TableName() string { return "ai_credit" }
