package service

import (
	"errors"
	"testing"

	"github.com/google/uuid"

	"github.com/nhienthai/lading-custom/backend/internal/models"
	"github.com/nhienthai/lading-custom/backend/internal/repository"
)

func systemTemplate(tier models.TemplateTier) *models.Template {
	return &models.Template{Type: models.TemplateSystem, Tier: tier}
}

func userTemplate(owner uuid.UUID, tier models.TemplateTier) *models.Template {
	return &models.Template{Type: models.TemplateUser, OwnerID: &owner, Tier: tier}
}

func TestCheckCloneAllowed(t *testing.T) {
	me := uuid.New()
	nguoiKhac := uuid.New()

	cases := []struct {
		name string
		tpl  *models.Template
		plan models.PlanType
		want error // nil = được phép
	}{
		{
			name: "free clone mẫu hệ thống free",
			tpl:  systemTemplate(models.TierFree),
			plan: models.PlanFree,
			want: nil,
		},
		{
			name: "free clone mẫu hệ thống PREMIUM thì bị chặn",
			tpl:  systemTemplate(models.TierPremium),
			plan: models.PlanFree,
			want: ErrUpgradeRequired,
		},
		{
			name: "pro clone mẫu hệ thống premium",
			tpl:  systemTemplate(models.TierPremium),
			plan: models.PlanPro,
			want: nil,
		},
		{
			// Hạ gói không được tịch thu ngược nội dung user đã sở hữu.
			name: "free clone mẫu premium CỦA CHÍNH MÌNH vẫn được",
			tpl:  userTemplate(me, models.TierPremium),
			plan: models.PlanFree,
			want: nil,
		},
		{
			name: "mẫu riêng của người khác bị chặn dù đang gói pro",
			tpl:  userTemplate(nguoiKhac, models.TierFree),
			plan: models.PlanPro,
			want: repository.ErrForbidden,
		},
		{
			// Quyền sở hữu phải xét TRƯỚC gói: báo "cần nâng cấp gói" cho mẫu
			// riêng tư của người khác là gợi ý rằng mẫu đó có thật, và người dùng
			// nâng gói xong vẫn không clone được.
			name: "mẫu premium riêng của người khác báo lỗi riêng tư, KHÔNG phải lỗi gói",
			tpl:  userTemplate(nguoiKhac, models.TierPremium),
			plan: models.PlanFree,
			want: repository.ErrForbidden,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := checkCloneAllowed(tc.tpl, me, tc.plan)

			if tc.want == nil {
				if got != nil {
					t.Fatalf("mong đợi được phép, nhận lỗi: %v", got)
				}
				return
			}
			if !errors.Is(got, tc.want) {
				t.Fatalf("nhận %v, mong đợi %v", got, tc.want)
			}
		})
	}
}

// Hai loại lỗi phải phân biệt được, vì handler map chúng ra 2 status khác nhau
// (402 mời nâng cấp / 403 bế tắc).
func TestCheckCloneAllowed_HaiLoaiLoiKhongLanNhau(t *testing.T) {
	me := uuid.New()

	loiGoi := checkCloneAllowed(systemTemplate(models.TierPremium), me, models.PlanFree)
	if errors.Is(loiGoi, repository.ErrForbidden) {
		t.Error("lỗi thiếu gói không được khớp sang ErrForbidden")
	}

	loiRiengTu := checkCloneAllowed(userTemplate(uuid.New(), models.TierFree), me, models.PlanFree)
	if errors.Is(loiRiengTu, ErrUpgradeRequired) {
		t.Error("lỗi riêng tư không được khớp sang ErrUpgradeRequired")
	}
}
