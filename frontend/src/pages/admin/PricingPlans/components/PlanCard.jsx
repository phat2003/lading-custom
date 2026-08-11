import { CheckIcon, XIcon } from '../../../../components/icons'

export default function PlanCard({ plan, onEdit }) {
  const { name, label, price, unit, features, highlighted, badge } = plan

  return (
    <div
      className={`relative rounded-xl border p-6 ${
        highlighted ? 'border-blue-500 bg-blue-500/5' : 'border-[var(--bd-border)] bg-[var(--bd-panel-solid)]'
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-blue-600 px-3 py-0.5 text-xs font-medium text-[var(--bd-text)]">
          {badge}
        </span>
      )}

      <span className="text-xs font-medium uppercase tracking-wide text-[var(--bd-muted)]">{label}</span>
      <h3 className="mt-2 text-xl font-bold text-[var(--bd-text)]">{name}</h3>
      <p className="mt-2">
        <span className="text-3xl font-bold text-[var(--bd-text)]">{price}</span>
        <span className="text-sm text-[var(--bd-muted)]"> {unit}</span>
      </p>

      <ul className="mt-5 space-y-3">
        {features.map((f) => (
          <li
            key={f.label}
            className={`flex items-center gap-2 text-sm ${
              f.included ? 'text-[var(--bd-text)]' : 'text-[var(--bd-muted)] line-through'
            }`}
          >
            {f.included ? (
              <CheckIcon size={16} className="shrink-0 text-green-400" />
            ) : (
              <XIcon size={16} className="shrink-0 text-[var(--bd-muted)]" />
            )}
            {f.label}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onEdit?.(plan)}
        className={`mt-6 w-full rounded-lg px-3 py-2 text-sm font-medium ${
          highlighted
            ? 'bg-blue-600 text-[var(--bd-text)] hover:bg-blue-500'
            : 'border border-[var(--bd-border)] text-[var(--bd-dim)] hover:bg-[var(--bd-fill-hover)]'
        }`}
      >
        Chỉnh sửa
      </button>
    </div>
  )
}
