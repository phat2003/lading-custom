package service

import (
	"testing"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

func jsonOf(s string) datatypes.JSON { return datatypes.JSON([]byte(s)) }

// OrderIndex phải suy từ vị trí trong mảng. Đây không phải chuyện thẩm mỹ:
// bảng template_section có UNIQUE (template_id, order_index), nên nếu nhận
// order_index từ client và client gửi trùng số thì cả transaction sẽ vỡ.
func TestToTemplateSections_ThuTuTheoViTriMang(t *testing.T) {
	in := []TemplateSectionInput{
		{SectionType: "hero", SectionContent: jsonOf(`{"title":"A"}`)},
		{SectionType: "features", SectionContent: jsonOf(`{"title":"B"}`)},
		{SectionType: "footer", SectionContent: jsonOf(`{"title":"C"}`)},
	}

	got := toTemplateSections(in)

	if len(got) != 3 {
		t.Fatalf("mong đợi 3 section, nhận %d", len(got))
	}
	for i, s := range got {
		if s.OrderIndex != i {
			t.Errorf("section %d có OrderIndex = %d, mong đợi %d", i, s.OrderIndex, i)
		}
	}
	if got[0].SectionType != "hero" || got[2].SectionType != "footer" {
		t.Errorf("thứ tự bị xáo trộn: %v", []string{got[0].SectionType, got[1].SectionType, got[2].SectionType})
	}
}

func TestToTemplateSections_GiuNguyenNoiDungJSON(t *testing.T) {
	content := `{"title":"Xin chào","items":[1,2,3]}`
	got := toTemplateSections([]TemplateSectionInput{
		{SectionType: "hero", SectionContent: jsonOf(content)},
	})

	if string(got[0].SectionContent) != content {
		t.Errorf("nội dung JSON bị đổi:\nnhận:      %s\nmong đợi: %s", got[0].SectionContent, content)
	}
}

func TestToTemplateSections_GiuLienKetToiThuVienSection(t *testing.T) {
	libID := uuid.New()
	got := toTemplateSections([]TemplateSectionInput{
		{SectionType: "hero", SectionContent: jsonOf(`{}`), SourceSectionTemplateID: &libID},
		{SectionType: "footer", SectionContent: jsonOf(`{}`)},
	})

	if got[0].SourceSectionTemplateID == nil || *got[0].SourceSectionTemplateID != libID {
		t.Errorf("mất liên kết tới section library: %v", got[0].SourceSectionTemplateID)
	}
	if got[1].SourceSectionTemplateID != nil {
		t.Errorf("section không có nguồn phải để nil, nhận %v", got[1].SourceSectionTemplateID)
	}
}

// Mảng rỗng phải ra slice rỗng chứ không nil: admin được phép tạo vỏ template
// trước rồi dựng nội dung sau, và repo vẫn lặp qua slice này bình thường.
func TestToTemplateSections_MangRong(t *testing.T) {
	got := toTemplateSections(nil)
	if got == nil {
		t.Fatal("phải trả slice rỗng, không phải nil")
	}
	if len(got) != 0 {
		t.Fatalf("mong đợi 0 phần tử, nhận %d", len(got))
	}
}

// TemplateID do repository gán bên trong transaction, service không được tự đặt.
func TestToTemplateSections_KhongTuGanTemplateID(t *testing.T) {
	got := toTemplateSections([]TemplateSectionInput{
		{SectionType: "hero", SectionContent: jsonOf(`{}`)},
	})

	if got[0].TemplateID != uuid.Nil {
		t.Errorf("TemplateID phải để trống cho repo gán, nhận %v", got[0].TemplateID)
	}
}
