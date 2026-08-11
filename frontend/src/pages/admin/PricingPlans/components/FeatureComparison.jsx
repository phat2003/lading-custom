import { CheckIcon, XIcon } from '../../../../components/icons'

function Cell({ value }) {
  if (value === true) return <CheckIcon size={16} className="mx-auto text-green-400" />
  if (value === false) return <XIcon size={16} className="mx-auto text-red-400" />
  const highlight = value === 'Vô hạn' || value === 'Tùy chỉnh'
  return <span className={highlight ? 'text-green-400' : 'text-[var(--bd-text)]'}>{value}</span>
}

export default function FeatureComparison({ columns = [], rows = [] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-[var(--bd-muted)]">
            <th className="px-5 py-3 text-left font-medium">Định mức tính năng</th>
            {columns.map((c) => (
              <th key={c} className="px-5 py-3 text-center font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.feature} className="border-t border-[var(--bd-border)]">
              <td className="px-5 py-3">
                <div className="font-medium text-[var(--bd-text)]">{r.feature}</div>
                {r.note && <div className="text-xs text-[var(--bd-muted)]">{r.note}</div>}
              </td>
              {r.values.map((v, i) => (
                <td key={i} className="px-5 py-3 text-center">
                  <Cell value={v} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
