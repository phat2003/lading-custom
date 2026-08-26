import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { profileApi } from '../../../api/profile'
import { useAuth } from '../../../context/AuthContext'
import ProjectMobileHeader from '../components/ProjectMobileHeader'
import ProjectSidebar from '../components/ProjectSidebar'

const profileValuesFromUser = (user) => ({
  fullName: user?.full_name || '',
  email: user?.email || '',
  phone: user?.phone || '',
})

const apiErrorMessage = (error, fallback) =>
  error?.response?.data?.error || error?.response?.data?.message || fallback

const fieldClassName = (invalid = false) =>
  `mt-2 w-full rounded-xl border bg-[var(--bd-fill)] px-4 py-3 text-sm text-[var(--bd-text)] outline-none transition placeholder:text-[var(--bd-dim)] disabled:cursor-not-allowed disabled:opacity-70 ${
    invalid
      ? 'border-red-400 focus:border-red-300 focus:ring-2 focus:ring-red-400/20'
      : 'border-[var(--bd-border)] focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20'
  }`

const Feedback = ({ type, children }) => {
  if (!children) return null

  return (
    <p
      className={`rounded-xl border px-4 py-3 text-sm ${
        type === 'error'
          ? 'border-red-400/30 bg-red-400/10 text-red-300'
          : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
      }`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      {children}
    </p>
  )
}

const UserSettingsPage = () => {
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const initialProfile = useMemo(() => profileValuesFromUser(user), [user])
  const [profileForm, setProfileForm] = useState(initialProfile)
  const [profileErrors, setProfileErrors] = useState({})
  const [profileFeedback, setProfileFeedback] = useState(null)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordFeedback, setPasswordFeedback] = useState(null)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const profileRequestInFlightRef = useRef(false)
  const passwordRequestInFlightRef = useRef(false)

  const normalizedProfile = {
    fullName: profileForm.fullName.trim(),
    email: profileForm.email,
    phone: profileForm.phone.trim(),
  }
  const profileDirty =
    normalizedProfile.fullName !== initialProfile.fullName.trim() ||
    normalizedProfile.phone !== initialProfile.phone.trim()
  const hasPasswordInput = Object.values(passwordForm).some(Boolean)

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), [])

  const updateProfileField = (field) => (event) => {
    setProfileForm((current) => ({ ...current, [field]: event.target.value }))
    setProfileErrors((current) => ({ ...current, [field]: '' }))
    setProfileFeedback(null)
  }

  const updatePasswordField = (field) => (event) => {
    setPasswordForm((current) => ({ ...current, [field]: event.target.value }))
    setPasswordErrors((current) => ({ ...current, [field]: '' }))
    setPasswordFeedback(null)
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    if (profileRequestInFlightRef.current || !profileDirty) return

    const nextErrors = {}
    if (!normalizedProfile.fullName) {
      nextErrors.fullName = 'Họ và tên không được để trống.'
    } else if (normalizedProfile.fullName.length > 150) {
      nextErrors.fullName = 'Họ và tên không được vượt quá 150 ký tự.'
    }
    if (normalizedProfile.phone.length > 20) {
      nextErrors.phone = 'Số điện thoại không được vượt quá 20 ký tự.'
    }
    if (Object.keys(nextErrors).length > 0) {
      setProfileErrors(nextErrors)
      setProfileFeedback(null)
      return
    }

    profileRequestInFlightRef.current = true
    setIsSavingProfile(true)
    setProfileErrors({})
    setProfileFeedback(null)

    try {
      await profileApi.update({
        full_name: normalizedProfile.fullName,
        phone: normalizedProfile.phone,
      })
      const refreshedUser = await refreshUser()
      setProfileForm(profileValuesFromUser(refreshedUser))
      setProfileFeedback({ type: 'success', message: 'Cập nhật hồ sơ thành công.' })
    } catch (error) {
      setProfileFeedback({
        type: 'error',
        message: apiErrorMessage(error, 'Không thể cập nhật hồ sơ. Vui lòng thử lại.'),
      })
    } finally {
      profileRequestInFlightRef.current = false
      setIsSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    if (passwordRequestInFlightRef.current) return

    const nextErrors = {}
    if (!passwordForm.currentPassword) {
      nextErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại.'
    }
    if (!passwordForm.newPassword) {
      nextErrors.newPassword = 'Vui lòng nhập mật khẩu mới.'
    } else if (passwordForm.newPassword.length < 6) {
      nextErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự.'
    }
    if (!passwordForm.confirmPassword) {
      nextErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới.'
    } else if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.'
    }
    if (Object.keys(nextErrors).length > 0) {
      setPasswordErrors(nextErrors)
      setPasswordFeedback(null)
      return
    }

    passwordRequestInFlightRef.current = true
    setIsChangingPassword(true)
    setPasswordErrors({})
    setPasswordFeedback(null)

    try {
      await profileApi.changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordFeedback({ type: 'success', message: 'Đổi mật khẩu thành công.' })
    } catch (error) {
      setPasswordFeedback({
        type: 'error',
        message: apiErrorMessage(error, 'Không thể đổi mật khẩu. Vui lòng thử lại.'),
      })
    } finally {
      passwordRequestInFlightRef.current = false
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bd-fill)] text-[var(--bd-text)]">
      <ProjectSidebar
        user={user}
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        onCreateProject={() => {
          closeMobileMenu()
          navigate('/projects', { state: { openCreateProject: true } })
        }}
      />

      <ProjectMobileHeader onOpenMenu={() => setIsMobileMenuOpen(true)} />

      <main className="min-h-screen pt-16 lg:ml-[280px] lg:pt-0">
        <header className="border-b border-[var(--bd-border)] bg-[var(--bd-topbar)] px-4 py-6 sm:px-8 lg:px-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--bd-accent)]">
            Tài khoản
          </p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Cài đặt tài khoản</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--bd-dim)]">
            Cập nhật thông tin cá nhân và bảo vệ tài khoản của bạn.
          </p>
        </header>

        <div className="mx-auto grid w-full max-w-4xl gap-6 px-4 py-8 sm:px-8 lg:px-10 lg:py-10">
          <section className="rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] p-5 shadow-sm sm:p-7">
            <div className="border-b border-[var(--bd-border)] pb-5">
              <h2 className="text-lg font-semibold">Hồ sơ cá nhân</h2>
              <p className="mt-1 text-sm text-[var(--bd-dim)]">
                Thông tin này được dùng để nhận diện tài khoản trong khu vực Project.
              </p>
            </div>

            <form className="mt-6 grid gap-5" onSubmit={handleProfileSubmit} noValidate>
              <div>
                <label className="text-sm font-medium" htmlFor="settings-full-name">
                  Họ và tên
                </label>
                <input
                  id="settings-full-name"
                  type="text"
                  value={profileForm.fullName}
                  onChange={updateProfileField('fullName')}
                  className={fieldClassName(Boolean(profileErrors.fullName))}
                  maxLength={150}
                  autoComplete="name"
                  aria-invalid={Boolean(profileErrors.fullName)}
                  aria-describedby={profileErrors.fullName ? 'settings-full-name-error' : undefined}
                />
                {profileErrors.fullName && (
                  <p id="settings-full-name-error" className="mt-2 text-xs text-red-300">
                    {profileErrors.fullName}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium" htmlFor="settings-email">
                  Email
                </label>
                <input
                  id="settings-email"
                  type="email"
                  value={profileForm.email}
                  className={fieldClassName()}
                  autoComplete="email"
                  readOnly
                  aria-readonly="true"
                />
                <p className="mt-2 text-xs text-[var(--bd-dim)]">
                  Email đăng nhập hiện không thể thay đổi tại đây.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium" htmlFor="settings-phone">
                  Số điện thoại <span className="font-normal text-[var(--bd-dim)]">(không bắt buộc)</span>
                </label>
                <input
                  id="settings-phone"
                  type="tel"
                  value={profileForm.phone}
                  onChange={updateProfileField('phone')}
                  className={fieldClassName(Boolean(profileErrors.phone))}
                  maxLength={20}
                  autoComplete="tel"
                  aria-invalid={Boolean(profileErrors.phone)}
                  aria-describedby={profileErrors.phone ? 'settings-phone-error' : undefined}
                />
                {profileErrors.phone && (
                  <p id="settings-phone-error" className="mt-2 text-xs text-red-300">
                    {profileErrors.phone}
                  </p>
                )}
              </div>

              <Feedback type={profileFeedback?.type}>{profileFeedback?.message}</Feedback>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!profileDirty || isSavingProfile}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/10 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto"
                >
                  {isSavingProfile ? 'Đang lưu...' : 'Lưu hồ sơ'}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] p-5 shadow-sm sm:p-7">
            <div className="border-b border-[var(--bd-border)] pb-5">
              <h2 className="text-lg font-semibold">Bảo mật</h2>
              <p className="mt-1 text-sm text-[var(--bd-dim)]">
                Đổi mật khẩu bằng cách xác nhận mật khẩu hiện tại.
              </p>
            </div>

            <form className="mt-6 grid gap-5" onSubmit={handlePasswordSubmit} noValidate>
              <div>
                <label className="text-sm font-medium" htmlFor="settings-current-password">
                  Mật khẩu hiện tại
                </label>
                <input
                  id="settings-current-password"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={updatePasswordField('currentPassword')}
                  className={fieldClassName(Boolean(passwordErrors.currentPassword))}
                  autoComplete="current-password"
                  aria-invalid={Boolean(passwordErrors.currentPassword)}
                  aria-describedby={passwordErrors.currentPassword ? 'settings-current-password-error' : undefined}
                />
                {passwordErrors.currentPassword && (
                  <p id="settings-current-password-error" className="mt-2 text-xs text-red-300">
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium" htmlFor="settings-new-password">
                    Mật khẩu mới
                  </label>
                  <input
                    id="settings-new-password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={updatePasswordField('newPassword')}
                    className={fieldClassName(Boolean(passwordErrors.newPassword))}
                    autoComplete="new-password"
                    aria-invalid={Boolean(passwordErrors.newPassword)}
                    aria-describedby={passwordErrors.newPassword ? 'settings-new-password-error' : undefined}
                  />
                  {passwordErrors.newPassword && (
                    <p id="settings-new-password-error" className="mt-2 text-xs text-red-300">
                      {passwordErrors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium" htmlFor="settings-confirm-password">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    id="settings-confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={updatePasswordField('confirmPassword')}
                    className={fieldClassName(Boolean(passwordErrors.confirmPassword))}
                    autoComplete="new-password"
                    aria-invalid={Boolean(passwordErrors.confirmPassword)}
                    aria-describedby={passwordErrors.confirmPassword ? 'settings-confirm-password-error' : undefined}
                  />
                  {passwordErrors.confirmPassword && (
                    <p id="settings-confirm-password-error" className="mt-2 text-xs text-red-300">
                      {passwordErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-[var(--bd-dim)]">
                Mật khẩu mới phải có ít nhất 6 ký tự.
              </p>
              <Feedback type={passwordFeedback?.type}>{passwordFeedback?.message}</Feedback>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!hasPasswordInput || isChangingPassword}
                  className="w-full rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)] px-5 py-3 text-sm font-semibold transition hover:border-violet-400/50 hover:bg-[var(--bd-fill-hover)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {isChangingPassword ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  )
}

export default UserSettingsPage
