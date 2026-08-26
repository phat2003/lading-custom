// Logo dùng chung cho toàn hệ thống (trang chủ, khu User, khu Admin).
// Đổi logo sau này chỉ cần sửa đúng file này.
//
// Lưu ý về kích thước: file PNG có sẵn quầng sáng trong suốt bao quanh, phần
// icon nhìn thấy chỉ chiếm ~69% chiều rộng ảnh. Vì vậy ô chứa phải to hơn ô
// gradient đặc trước đây thì logo mới cân bằng thị giác — đừng thu nhỏ lại.
const SIZES = {
  sm: 'h-10 w-10', // header mobile
  md: 'h-11 w-11', // navbar, sidebar
  lg: 'h-16 w-16', // trang đăng nhập / đăng ký
}

const Logo = ({ size = 'md', className = '' }) => (
  <img
    src="/logo_LP_Builder.png"
    alt="LP Builder"
    // shrink-0 để logo không bị bóp méo khi đặt trong flex cùng chữ dài.
    className={`${SIZES[size] || SIZES.md} shrink-0 select-none object-contain ${className}`}
    draggable="false"
  />
)

export default Logo
