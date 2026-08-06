export default function SettingsSection({ number, title, badge, description, headerRight, children }) {
  return (
    <div className="flex gap-4 md:gap-6">
      <div className="hidden w-8 shrink-0 pt-0.5 text-2xl font-bold text-[var(--bd-muted)] md:block">
        {number}
      </div>
      <div className="flex-1 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-[var(--bd-text)]">
              {title}
              {badge}
            </h2>
            {description && <p className="mt-0.5 text-sm text-[var(--bd-dim)]">{description}</p>}
          </div>
          {headerRight}
        </div>
        {children}
      </div>
    </div>
  )
}
