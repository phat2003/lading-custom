import {
  FolderIcon,
  PencilIcon,
  TrashIcon,
} from '../../../../components/icons'

const ProjectPreview = ({ type }) => {
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

function formatUpdatedAt(value) {
  if (!value) return 'Chưa rõ thời gian cập nhật'

  const updatedAt = new Date(value)
  if (Number.isNaN(updatedAt.getTime())) return 'Chưa rõ thời gian cập nhật'

  return `Cập nhật ${new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(updatedAt)}`
}

const ProjectCard = ({ project, onOpen, onRename, onDelete }) => {
  return (
    <article
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#1c1b1d] text-left transition duration-300 hover:-translate-y-1 hover:border-[#00eefc]/55 hover:shadow-[0_16px_40px_rgba(0,238,252,0.06)]"
    >
      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 z-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#b4c5ff]"
        aria-label={`Mở Project ${project.name}`}
      />

      <div className="relative h-48 overflow-hidden border-b border-white/10">
        <ProjectPreview type={project.previewType} />
        <div className="absolute inset-0 grid place-items-center bg-[#131315]/65 opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
          <span className="rounded-full bg-[#b4c5ff] px-4 py-2 font-mono text-xs font-bold text-[#002a78]">
            Mở Project
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate text-xl font-semibold text-white transition group-hover:text-[#d3fbff]">
            {project.name}
          </h3>
          <div className="relative z-20 flex shrink-0 gap-1">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onRename()
              }}
              className="rounded-lg p-2 text-[#c3c6d7] transition hover:bg-white/10 hover:text-white"
              aria-label={`Đổi tên Project ${project.name}`}
            >
              <PencilIcon size={16} />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onDelete()
              }}
              className="rounded-lg p-2 text-[#ffb4ab] transition hover:bg-[#3b2526]"
              aria-label={`Xóa Project ${project.name}`}
            >
              <TrashIcon size={16} />
            </button>
          </div>
        </div>
        <p className="mt-4 flex items-center gap-2 font-mono text-[11px] text-[#c3c6d7]">
          <span aria-hidden="true">▣</span>
          {formatUpdatedAt(project.updatedAt)}
        </p>
      </div>
    </article>
  )
}

export default ProjectCard
