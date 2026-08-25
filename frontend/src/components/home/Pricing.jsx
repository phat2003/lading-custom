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
  <ul className="space-y-4 border-t border-slate-900 pt-6 text-sm text-slate-300">
    {items.map((item) => (
      <li key={item} className="flex items-center gap-3">
        <svg className="h-5 w-5 flex-shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span>{item}</span>
      </li>
    ))}
  </ul>
)

export default function Pricing() {
  const { user } = useAuth()
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const freeCurrent = Boolean(user) && isFreePlan(user)
  const proCurrent = Boolean(user) && isProPlan(user)

  return (
    <>
    <section id="pricing" className="relative border-t border-slate-900 bg-slate-950 py-20">
      {/* Background glow behind pricing cards */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal">
            Bảng giá đơn giản
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Chọn gói phù hợp nhất với quy mô hoạt động và nhu cầu thực tế của bạn.
          </p>
        </div>

        {/* Pricing Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Free Plan */}
          <div className="border border-slate-900 bg-slate-950/60 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-800 transition-all duration-300 shadow-xl backdrop-blur-sm">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-white">Free</h3>
                  {freeCurrent && <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">Gói hiện tại</span>}
                </div>
                <p className="text-sm text-slate-400">Khởi đầu cho dự án nhỏ hoàn toàn miễn phí</p>
              </div>

              {/* Price */}
              <div className="text-4xl font-extrabold tracking-tight text-white">Miễn phí</div>

              {/* Features List */}
              <FeatureList items={FREE_FEATURES} />
            </div>

            {/* Action */}
            <div className="pt-8">
              {user ? (
                <div className="block w-full rounded-xl border border-slate-800 bg-slate-900/50 py-3.5 text-center text-sm font-semibold text-slate-400">
                  {freeCurrent ? 'Gói hiện tại' : 'Gói Free'}
                </div>
              ) : (
                <Link
                  to="/register"
                  className="block w-full rounded-xl border border-slate-800 bg-slate-900/50 py-3.5 text-center text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800/80 hover:text-white"
                >
                  Bắt đầu miễn phí
                </Link>
              )}
            </div>
          </div>

          {/* Pro Plan (Highlighted) */}
          <div className="relative border-2 border-blue-600 bg-slate-950/80 rounded-3xl p-8 flex flex-col justify-between hover:shadow-[0_0_30px_rgba(37,99,235,0.15)] transition-all duration-300 shadow-2xl backdrop-blur-sm">
            {/* Best Seller Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-full uppercase">
              BÁN CHẠY NHẤT
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-bold text-white">Pro</h3>
                  {proCurrent && <span className="rounded-full bg-blue-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-200">Gói hiện tại</span>}
                </div>
                <p className="text-sm text-slate-400">Lựa chọn tốt nhất cho doanh nghiệp chuyên nghiệp</p>
              </div>

              {/* Price */}
              <div className="flex items-baseline text-white">
                <span className="text-4xl font-extrabold tracking-tight">299.000 VNĐ</span>
                <span className="ml-1 text-sm text-slate-500 font-medium">/tháng</span>
              </div>

              {/* Features List */}
              <FeatureList items={PRO_FEATURES} />
            </div>

            {/* Action */}
            <div className="pt-8">
              {proCurrent ? (
                <div className="block w-full rounded-xl bg-blue-600/20 py-3.5 text-center text-sm font-semibold text-blue-200">
                  Gói hiện tại
                </div>
              ) : user ? (
                <button
                  type="button"
                  onClick={() => setUpgradeOpen(true)}
                  className="block w-full rounded-xl bg-blue-600 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-600/40 active:translate-y-0"
                >
                  Nâng cấp Pro
                </button>
              ) : (
                <Link
                  to="/register"
                  className="block w-full rounded-xl bg-blue-600 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-blue-600/40 active:translate-y-0"
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
