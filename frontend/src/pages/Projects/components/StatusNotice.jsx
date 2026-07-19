export default function StatusNotice({ children }) {
  if (!children) return null

  return (
    <div
      className="fixed bottom-5 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-cyan-300/25 bg-[#201f21] px-4 py-3 text-center text-sm text-[#d3fbff] shadow-2xl"
      role="status"
    >
      {children}
    </div>
  )
}
