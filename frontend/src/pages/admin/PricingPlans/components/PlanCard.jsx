import { CheckIcon, XIcon } from '../../../../components/icons'

export default function PlanCard({ plan, onEdit }) {
  const { name, label, price, unit, features, highlighted, badge } = plan

  return (
    <div
      className={`relative rounded-xl border p-6 ${
        highlighted ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 bg-[#111725]'
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-blue-600 px-3 py-0.5 text-xs font-medium text-white">
          {badge}
        </span>
      )}

      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
      <h3 className="mt-2 text-xl font-bold text-white">{name}</h3>
      <p className="mt-2">
        <span className="text-3xl font-bold text-white">{price}</span>
        <span className="text-sm text-slate-500"> {unit}</span>
      </p>

      <ul className="mt-5 space-y-3">
        {features.map((f) => (
          <li
            key={f.label}
            className={`flex items-center gap-2 text-sm ${
              f.included ? 'text-slate-200' : 'text-slate-600 line-through'
            }`}
          >
            {f.included ? (
              <CheckIcon size={16} className="shrink-0 text-green-400" />
            ) : (
              <XIcon size={16} className="shrink-0 text-slate-600" />
            )}
            {f.label}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onEdit?.(plan)}
        className={`mt-6 w-full rounded-lg px-3 py-2 text-sm font-medium ${
          highlighted
            ? 'bg-blue-600 text-white hover:bg-blue-500'
            : 'border border-slate-700 text-slate-300 hover:bg-slate-800'
        }`}
      >
        Chỉnh sửa
      </button>
    </div>
  )
}
