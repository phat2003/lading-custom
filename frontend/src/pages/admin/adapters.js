// Quy đổi dữ liệu API (snake_case, enum chữ thường) sang shape các component
// admin đang dùng (nhãn viết hoa). Đặt chung ở đây vì nhiều trang cùng cần —
// Users và Dashboard đều hiển thị user, tránh mỗi nơi tự map một kiểu.

// ISO date -> dd/mm/yyyy. Chuỗi rỗng / không hợp lệ -> "—".
export const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('vi-VN')
}

// app_user -> shape dùng cho UserTable, RecentUsersTable, UserDetailPanel.
// Giữ kèm isActive/planType bản gốc để gửi ngược lên khi cập nhật.
export const toUserUI = (u) => ({
  id: u.user_id,
  name: u.full_name || u.email,
  email: u.email,
  plan: u.plan_type === 'pro' ? 'Pro' : 'Free',
  status: u.is_active ? 'Active' : 'Inactive',
  phone: u.phone || '—',
  joined: formatDate(u.created_at),
  role: u.role,
  isActive: u.is_active,
  planType: u.plan_type,
})

// Lấy thông báo lỗi backend trả về; không có thì dùng câu mặc định.
export const errMsg = (err, fallback) => err?.response?.data?.error || fallback
