export default function StatusNotice({ children }) {
  if (!children) return null

  return (
    <div
      className="fixed bottom-5 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-cyan-300/25 bg-[var(--bd-topbar)] px-4 py-3 text-center text-sm text-[var(--bd-info)] shadow-2xl"
      role="status"
    >
      {children}
    </div>
  )
}
