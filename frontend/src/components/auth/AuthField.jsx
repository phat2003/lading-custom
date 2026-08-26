import { EyeIcon, EyeOffIcon } from '../icons'

// Ô nhập của trang Đăng nhập / Đăng ký.
// Dùng lại lớp .ad-input của khu Admin để màu sắc, viền và hiệu ứng focus khớp
// hệt nhau; chỉ nới padding cho vừa icon và cỡ chữ lớn hơn của trang auth.
const AuthField = ({
  label,
  icon,
  error,
  type = 'text',
  showToggle = false,
  revealed = false,
  onToggleReveal,
  ...inputProps
}) => (
  <div>
    <label className="ad-label">{label}</label>
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--bd-muted)]">
        {icon}
      </span>

      <input
        type={showToggle ? (revealed ? 'text' : 'password') : type}
        // pl-11 chừa chỗ cho icon trái, pr-12 cho nút hiện/ẩn mật khẩu.
        className={`ad-input py-3.5 pl-11 ${showToggle ? 'pr-12' : 'pr-4'} ${
          error ? 'border-[var(--bd-danger)]' : ''
        }`}
        {...inputProps}
      />

      {showToggle && (
        <button
          type="button"
          onClick={onToggleReveal}
          title={revealed ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--bd-muted)] transition-colors hover:text-[var(--bd-text)]"
        >
          {revealed ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </button>
      )}
    </div>

    {error && <p className="mt-1.5 text-xs text-[var(--bd-danger)]">{error}</p>}
  </div>
)

export default AuthField
