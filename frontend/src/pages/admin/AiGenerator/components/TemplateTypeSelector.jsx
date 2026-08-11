import {
  LayoutTemplateIcon,
  LayoutDashboardIcon,
  MailIcon,
  SmartphoneIcon,
} from '../../../../components/icons'

const TYPES = [
  { value: 'landing', label: 'Landing Page', icon: LayoutTemplateIcon },
  { value: 'dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  { value: 'email', label: 'Email', icon: MailIcon },
  { value: 'mobile', label: 'Ứng dụng di động', icon: SmartphoneIcon },
]

export default function TemplateTypeSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {TYPES.map(({ value: v, label, icon: IconComp }) => {
        const active = v === value
        return (
          <button
            key={v}
            onClick={() => onChange?.(v)}
            className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-sm ${
              active
                ? 'border-blue-500 bg-blue-500/10 text-[var(--bd-text)]'
                : 'border-[var(--bd-border)] bg-[var(--bd-fill)] text-[var(--bd-dim)] hover:border-[var(--bd-border)]'
            }`}
          >
            <IconComp size={20} className={active ? 'text-blue-400' : 'text-[var(--bd-muted)]'} />
            {label}
          </button>
        )
      })}
    </div>
  )
}
