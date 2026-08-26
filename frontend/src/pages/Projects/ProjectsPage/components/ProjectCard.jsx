import {
  FolderIcon,
  PencilIcon,
  TrashIcon,
} from '../../../../components/icons'

const ProjectPreview = ({ type }) => {
  if (type === 1) {
    return (
      <div className="absolute inset-0 bg-[var(--bd-fill)] bg-gradient-to-br from-violet-500/20 via-cyan-400/15 to-violet-600/10 p-5">
        <div className="mb-4 h-2 w-20 rounded-full bg-cyan-300/60" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-12 rounded border border-cyan-300/15 bg-cyan-300/5" />
          <div className="h-12 rounded border border-blue-300/15 bg-blue-300/5" />
          <div className="h-12 rounded border border-violet-300/15 bg-violet-300/5" />
        </div>
        <div className="mt-4 flex h-16 items-end gap-1 rounded border border-[var(--bd-border)] bg-[var(--bd-fill)] p-2">
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
      <div className="absolute inset-0 bg-[var(--bd-fill)] bg-gradient-to-br from-cyan-400/15 to-violet-500/25 p-6">
        <div className="h-2 w-16 rounded-full bg-[var(--bd-dim)]" />
        <div className="mt-5 h-4 w-3/4 rounded bg-[var(--bd-fill-hover)]" />
        <div className="mt-2 h-2 w-1/2 rounded bg-[var(--bd-fill)]" />
        <div className="mt-6 h-14 rounded-lg border border-[var(--bd-border)] bg-gradient-to-r from-cyan-400/20 to-blue-500/20" />
      </div>
    )
  }

  return (
    <div className="absolute inset-0 grid place-items-center bg-[var(--bd-fill)] project-preview-grid">
      <div className="grid h-16 w-16 place-items-center rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)] text-[var(--bd-muted)]">
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
      className="group relative overflow-hidden rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] text-left transition duration-300 hover:-translate-y-1 hover:border-cyan-400/55 hover:shadow-[0_16px_40px_rgba(0,238,252,0.06)]"
    >
      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 z-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-300"
        aria-label={`Mở Project ${project.name}`}
      />

      <div className="relative h-48 overflow-hidden border-b border-[var(--bd-border)]">
        <ProjectPreview type={project.previewType} />
        <div className="absolute inset-0 grid place-items-center bg-[var(--bd-chip)] opacity-0 backdrop-blur-sm transition group-hover:opacity-100">
          <span className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 font-mono text-xs font-bold text-white">
            Mở Project
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 truncate text-xl font-semibold text-[var(--bd-text)] transition group-hover:text-[var(--bd-info)]">
            {project.name}
          </h3>
          <div className="relative z-20 flex shrink-0 gap-1">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                onRename()
              }}
              className="rounded-lg p-2 text-[var(--bd-dim)] transition hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]"
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
              className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/10"
              aria-label={`Xóa Project ${project.name}`}
            >
              <TrashIcon size={16} />
            </button>
          </div>
        </div>
        <p className="mt-4 flex items-center gap-2 font-mono text-[11px] text-[var(--bd-dim)]">
          <span aria-hidden="true">▣</span>
          {formatUpdatedAt(project.updatedAt)}
        </p>
      </div>
    </article>
  )
}

export default ProjectCard
