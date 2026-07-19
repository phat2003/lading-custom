import { FolderIcon } from '../../../../components/icons'

function ProjectPreview({ type }) {
  if (type === 1) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-[#071421] via-[#102a42] to-[#081017] p-5">
        <div className="mb-4 h-2 w-20 rounded-full bg-cyan-300/60" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-12 rounded border border-cyan-300/15 bg-cyan-300/5" />
          <div className="h-12 rounded border border-blue-300/15 bg-blue-300/5" />
          <div className="h-12 rounded border border-violet-300/15 bg-violet-300/5" />
        </div>
        <div className="mt-4 flex h-16 items-end gap-1 rounded border border-white/5 bg-black/20 p-2">
          {[35, 60, 45, 80, 52, 92, 70, 100].map((height, index) => (
            <span
              key={index}
              className="flex-1 rounded-t bg-cyan-300/45"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (type === 2) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-[#111827] to-[#312e81] p-6">
        <div className="h-2 w-16 rounded-full bg-white/70" />
        <div className="mt-5 h-4 w-3/4 rounded bg-white/20" />
        <div className="mt-2 h-2 w-1/2 rounded bg-white/10" />
        <div className="mt-6 h-14 rounded-lg border border-white/10 bg-gradient-to-r from-cyan-400/20 to-blue-500/20" />
      </div>
    )
  }

  return (
    <div className="absolute inset-0 grid place-items-center bg-[#2a2a2c] project-preview-grid">
      <div className="grid h-16 w-16 place-items-center rounded-xl border border-white/10 bg-[#353437] text-[#8d90a0]">
        <FolderIcon size={30} />
      </div>
    </div>
  )
}

export default function ProjectCard({ project, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group overflow-hidden rounded-xl border border-white/10 bg-[#1c1b1d] text-left transition duration-300 hover:-translate-y-1 hover:border-[#00eefc]/55 hover:shadow-[0_16px_40px_rgba(0,238,252,0.06)] focus:outline-none focus:ring-2 focus:ring-[#b4c5ff]"
    >
      <div className="relative h-48 overflow-hidden border-b border-white/10">
        <ProjectPreview type={project.previewType} />
        <div className="absolute inset-0 grid place-items-center bg-[#131315]/65 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
          <span className="rounded-full bg-[#b4c5ff] px-4 py-2 font-mono text-xs font-bold text-[#002a78]">
            Mở Project
          </span>
        </div>
        <span className="absolute right-3 top-3 flex items-center gap-2 rounded-full border border-white/10 bg-[#201f21]/85 px-3 py-1 font-mono text-[10px] uppercase text-[#c3c6d7] backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-[#eec200]" />
          {project.status}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-xl font-semibold text-white transition group-hover:text-[#d3fbff]">
          {project.name}
        </h3>
        <p className="mt-4 flex items-center gap-2 font-mono text-[11px] text-[#c3c6d7]">
          <span aria-hidden="true">▣</span>
          Cập nhật {project.updatedAt.toLowerCase()}
        </p>
      </div>
    </button>
  )
}
