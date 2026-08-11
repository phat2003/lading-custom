package models

import (
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
}

func (SectionTemplateLibrary) TableName() string { return "section_template_library" }

// Template — system (admin) hoặc user (lưu từ landing page).
type Template struct {
	TemplateID     uuid.UUID      `gorm:"column:template_id;type:uuid;default:gen_random_uuid();primaryKey" json:"template_id"`
	Name           string         `gorm:"column:name;not null" json:"name"`
	Type           TemplateType   `gorm:"column:type;type:template_type;not null" json:"type"`
	OwnerID        *uuid.UUID     `gorm:"column:owner_id;type:uuid" json:"owner_id,omitempty"` // null nếu system
	TemplateSource TemplateSource `gorm:"column:template_source;type:template_source;not null" json:"template_source"`
	CreatedAt      time.Time      `gorm:"column:created_at" json:"created_at"`

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
	CreatedAt        time.Time         `gorm:"column:created_at" json:"created_at"`
	UpdatedAt        time.Time         `gorm:"column:updated_at" json:"updated_at"`

	Sections []PageSection `gorm:"foreignKey:LandingPageID" json:"sections,omitempty"`
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

// PublishedSnapshot — bản chụp nội dung tại thời điểm publish.
type PublishedSnapshot struct {
	SnapshotID      uuid.UUID      `gorm:"column:snapshot_id;type:uuid;default:gen_random_uuid();primaryKey" json:"snapshot_id"`
	LandingPageID   uuid.UUID      `gorm:"column:landing_page_id;type:uuid;not null" json:"landing_page_id"`
	PublishedURL    string         `gorm:"column:published_url;uniqueIndex;not null" json:"published_url"`
	SnapshotContent datatypes.JSON `gorm:"column:snapshot_content;type:jsonb;not null" json:"snapshot_content"`
	PublishedBy     *uuid.UUID     `gorm:"column:published_by;type:uuid" json:"published_by,omitempty"`
	PublishedAt     time.Time      `gorm:"column:published_at" json:"published_at"`
}

func (PublishedSnapshot) TableName() string { return "published_snapshot" }

