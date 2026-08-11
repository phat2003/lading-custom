package handlers

import (
	"testing"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

func TestParsePositiveInt(t *testing.T) {
	const fallback = 10

	cases := []struct {
		name string
		raw  string
		want int
	}{
		{"số hợp lệ", "5", 5},
		{"chuỗi rỗng về mặc định", "", fallback},
		{"chữ về mặc định", "abc", fallback},
		{"số 0 về mặc định", "0", fallback},
		{"số âm về mặc định", "-3", fallback},
		{"số thập phân về mặc định", "1.5", fallback},
		{"có khoảng trắng về mặc định", " 5 ", fallback},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := parsePositiveInt(tc.raw, fallback); got != tc.want {
				t.Errorf("parsePositiveInt(%q) = %d, mong đợi %d", tc.raw, got, tc.want)
			}
		})
	}
}

func TestIsAllowedFilter(t *testing.T) {
	cases := []struct {
		name  string
		value string
		want  bool
	}{
		{"rỗng = không lọc", "", true},
		{"all = không lọc", "all", true},
		{"giá trị hợp lệ", "draft", true},
		{"giá trị hợp lệ khác", "published", true},
		{"giá trị lạ bị chặn", "deleted", false},
		{"phân biệt hoa thường", "Draft", false},
		{"thử tiêm SQL bị chặn", "draft' OR '1'='1", false},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := isAllowedFilter(tc.value, "draft", "published"); got != tc.want {
				t.Errorf("isAllowedFilter(%q) = %v, mong đợi %v", tc.value, got, tc.want)
			}
		})
	}
}

func TestToSectionInputs(t *testing.T) {
	libID := uuid.New()
	reqs := []templateSectionRequest{
		{
			SectionType:             "hero",
			SectionContent:          datatypes.JSON([]byte(`{"title":"A"}`)),
			SourceSectionTemplateID: &libID,
		},
		{
			SectionType:    "footer",
			SectionContent: datatypes.JSON([]byte(`{"text":"B"}`)),
		},
	}

	got := toSectionInputs(reqs)

	if len(got) != 2 {
		t.Fatalf("mong đợi 2 phần tử, nhận %d", len(got))
	}
	if got[0].SectionType != "hero" || string(got[0].SectionContent) != `{"title":"A"}` {
		t.Errorf("phần tử 0 sai: %+v", got[0])
	}
	if got[0].SourceSectionTemplateID == nil || *got[0].SourceSectionTemplateID != libID {
		t.Errorf("mất SourceSectionTemplateID: %v", got[0].SourceSectionTemplateID)
	}
	if got[1].SourceSectionTemplateID != nil {
		t.Errorf("phần tử không có nguồn phải để nil, nhận %v", got[1].SourceSectionTemplateID)
	}
}

func TestToSectionInputs_MangRong(t *testing.T) {
	got := toSectionInputs(nil)
	if got == nil {
		t.Fatal("phải trả slice rỗng, không phải nil")
	}
	if len(got) != 0 {
		t.Fatalf("mong đợi 0 phần tử, nhận %d", len(got))
	}
}
