import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import UpgradeRequiredDialog from '../pricing/UpgradeRequiredDialog'
import { isFreePlan, isProPlan } from '../../utils/planEntitlements'

const FREE_FEATURES = [
  '1 Project',
  '3 Free Template',
  'Realtime Preview',
  'Responsive Preview',
  'Publish Public Link',
  'Export PDF',
  'Watermark hệ thống',
]

const PRO_FEATURES = [
  'Không giới hạn Project',
  'Premium Template',
  'Export HTML/CSS/JS',
  'Custom Branding',
  'Không watermark',
]

const FeatureList = ({ items }) => (
  <ul className="space-y-4 border-t border-[var(--bd-border)] pt-6 text-sm text-[var(--bd-dim)]">
    {items.map((item) => (
      <li key={item} className="flex items-center gap-3">
        <svg className="h-5 w-5 flex-shrink-0 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span>{item}</span>
      </li>
    ))}
  </ul>
)

const Pricing = () => {
  const { user } = useAuth()
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const freeCurrent = Boolean(user) && isFreePlan(user)
  const proCurrent = Boolean(user) && isProPlan(user)

  return (
    <>
      <section id="pricing" className="lp-section">
        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-2xl space-y-4 text-center">
            <h2 className="lp-title">Bảng giá đơn giản</h2>
            <p className="lp-sub">
              Chọn gói phù hợp nhất với quy mô hoạt động và nhu cầu thực tế của bạn.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
            {/* Gói Free */}
            <div className="flex flex-col justify-between rounded-3xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] p-8 shadow-xl transition-all duration-300 hover:border-violet-400/30">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-bold text-[var(--bd-text)]">Free</h3>
                    {freeCurrent && (
                      <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        Gói hiện tại
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--bd-dim)]">
                    Khởi đầu cho dự án nhỏ hoàn toàn miễn phí
                  </p>
                </div>

                <div className="text-4xl font-extrabold tracking-tight text-[var(--bd-text)]">
                  Miễn phí
                </div>

                <FeatureList items={FREE_FEATURES} />
              </div>

              <div className="pt-8">
                {user ? (
                  <div className="block w-full rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)] py-3.5 text-center text-sm font-semibold text-[var(--bd-muted)]">
                    {freeCurrent ? 'Gói hiện tại' : 'Gói Free'}
                  </div>
                ) : (
                  <Link
                    to="/register"
                    className="block w-full rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)] py-3.5 text-center text-sm font-semibold text-[var(--bd-dim)] transition-all duration-200 hover:border-violet-400/40 hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]"
                  >
                    Bắt đầu miễn phí
                  </Link>
                )}
              </div>
            </div>

            {/* Gói Pro — được làm nổi bằng viền gradient */}
            <div className="relative flex flex-col justify-between rounded-3xl border-2 border-violet-500/60 bg-[var(--bd-panel-solid)] p-8 shadow-2xl transition-all duration-300 hover:shadow-[0_0_40px_-10px_rgba(139,92,246,.6)]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-[0_0_20px_-6px_rgba(139,92,246,.9)]">
                BÁN CHẠY NHẤT
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-bold text-[var(--bd-text)]">Pro</h3>
                    {proCurrent && (
                      <span className="rounded-full bg-violet-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--bd-accent)]">
                        Gói hiện tại
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--bd-dim)]">
                    Lựa chọn tốt nhất cho doanh nghiệp chuyên nghiệp
                  </p>
                </div>

                <div className="flex items-baseline text-[var(--bd-text)]">
                  <span className="text-4xl font-extrabold tracking-tight">299.000 VNĐ</span>
                  <span className="ml-1 text-sm font-medium text-[var(--bd-muted)]">/tháng</span>
                </div>

                <FeatureList items={PRO_FEATURES} />
              </div>

              <div className="pt-8">
                {proCurrent ? (
                  <div className="block w-full rounded-xl bg-violet-500/15 py-3.5 text-center text-sm font-semibold text-[var(--bd-accent)]">
                    Gói hiện tại
                  </div>
                ) : user ? (
                  <button
                    type="button"
                    onClick={() => setUpgradeOpen(true)}
                    className="block w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 py-3.5 text-center text-sm font-semibold text-white shadow-[0_0_26px_-6px_rgba(139,92,246,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_34px_-2px_rgba(139,92,246,1)] active:translate-y-0"
                  >
                    Nâng cấp Pro
                  </button>
                ) : (
                  <Link
                    to="/register"
                    className="block w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 py-3.5 text-center text-sm font-semibold text-white shadow-[0_0_26px_-6px_rgba(139,92,246,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_34px_-2px_rgba(139,92,246,1)] active:translate-y-0"
                  >
                    Đăng ký để dùng Pro
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <UpgradeRequiredDialog
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        reason="Gói Pro đã được mô tả đầy đủ, nhưng hệ thống hiện chưa có checkout tự phục vụ để hoàn tất nâng cấp."
        currentPlan={user}
        showPricingAction={false}
      />
    </>
  )
}

export default Pricing
