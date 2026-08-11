package middleware

import (
	"testing"
	"time"
)

func TestRateLimiter_ChanKhiVuotHanMuc(t *testing.T) {
	rl := NewRateLimiter(3, time.Minute)
	now := time.Now()

	for i := 1; i <= 3; i++ {
		if !rl.allow("1.1.1.1", now) {
			t.Fatalf("request thứ %d phải được cho qua", i)
		}
	}
	if rl.allow("1.1.1.1", now) {
		t.Fatal("request thứ 4 phải bị chặn")
	}
}

func TestRateLimiter_MoiIPDemRieng(t *testing.T) {
	rl := NewRateLimiter(1, time.Minute)
	now := time.Now()

	if !rl.allow("1.1.1.1", now) {
		t.Fatal("IP thứ nhất phải được cho qua")
	}
	if !rl.allow("2.2.2.2", now) {
		t.Fatal("IP thứ hai không được ăn theo hạn mức của IP thứ nhất")
	}
}

func TestRateLimiter_MoCuaLaiSauKhiHetCuaSo(t *testing.T) {
	rl := NewRateLimiter(1, time.Minute)
	now := time.Now()

	rl.allow("1.1.1.1", now)
	if rl.allow("1.1.1.1", now) {
		t.Fatal("phải bị chặn khi còn trong cửa sổ")
	}
	if !rl.allow("1.1.1.1", now.Add(time.Minute+time.Second)) {
		t.Fatal("phải được cho qua sau khi cửa sổ hết hạn")
	}
}

// Bộ đếm phải tự dọn, nếu không map phình mãi theo số IP từng gọi API.
func TestRateLimiter_DonBanGhiHetHan(t *testing.T) {
	rl := NewRateLimiter(1, time.Minute)
	now := time.Now()

	rl.allow("1.1.1.1", now)
	rl.allow("2.2.2.2", now)
	if len(rl.hits) != 2 {
		t.Fatalf("mong đợi 2 bản ghi, nhận %d", len(rl.hits))
	}

	// Vượt qua mốc gcEvery (= 10 lần cửa sổ) thì lượt gọi kế tiếp phải dọn sạch
	// các IP cũ, chỉ còn lại IP vừa gọi.
	rl.allow("3.3.3.3", now.Add(11*time.Minute))
	if len(rl.hits) != 1 {
		t.Fatalf("bản ghi hết hạn phải bị xoá, còn lại %d", len(rl.hits))
	}
}
