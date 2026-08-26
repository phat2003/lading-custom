import { useEffect } from 'react'
import { XIcon } from '../icons'
import { normalizePlan } from '../../utils/planEntitlements'

const PRO_BENEFITS = [
  'Không giới hạn Project',
  'Premium Template',
  'Export HTML/CSS/JS',
  'Custom Branding và không watermark',
]

const UpgradeRequiredDialog = ({
  open,
  onClose,
  reason = 'Tính năng này yêu cầu gói Pro.',
  currentPlan,
  showPricingAction = true,
}) => {
  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])

  if (!open) return null

  const openPricing = () => {
    onClose()
    window.location.assign('/#pricing')
  }

  return (
    <div
      className="fixed inset-0 z-[120] grid place-items-center bg-black/75 px-4 py-8 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-required-title"
        aria-describedby="upgrade-required-description"
        className="relative w-full max-w-lg rounded-2xl border border-[#eec200]/30 bg-[#201f21] p-6 text-[#e5e1e4] shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-[#c3c6d7] transition hover:bg-white/5 hover:text-white"
          aria-label="Đóng thông báo nâng cấp"
        >
          <XIcon size={20} />
        </button>

        <span className="inline-flex rounded-full border border-[#eec200]/30 bg-[#eec200]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#ffe083]">
          Gói hiện tại: {normalizePlan(currentPlan) === 'pro' ? 'Pro' : 'Free'}
        </span>
        <h2 id="upgrade-required-title" className="mt-5 text-2xl font-semibold text-white">
          Mở khóa với Pro
        </h2>
        <p id="upgrade-required-description" className="mt-2 text-sm leading-6 text-[#c3c6d7]">
          {reason}
        </p>

        <ul className="mt-6 grid gap-3 text-sm text-[#e5e1e4] sm:grid-cols-2">
          {PRO_BENEFITS.map((benefit) => (
            <li key={benefit} className="flex gap-2 rounded-xl bg-white/[0.04] px-3 py-2.5">
              <span className="text-[#00eefc]" aria-hidden="true">✓</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>

        <p className="mt-5 rounded-xl border border-white/10 bg-[#131315] px-4 py-3 text-xs leading-5 text-[#c3c6d7]">
          Thanh toán và tự nâng cấp chưa được Backend hỗ trợ. Hệ thống sẽ không tự đổi gói hoặc tạo giao dịch.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-[#e5e1e4] transition hover:bg-white/5"
          >
            Đóng
          </button>
          {showPricingAction && (
            <button
              type="button"
              onClick={openPricing}
              className="rounded-xl bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Xem gói Pro
            </button>
          )}
        </div>
      </section>
    </div>
  )
}

export default UpgradeRequiredDialog
