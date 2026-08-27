import { useEffect, useRef, useState } from 'react'
import {
  ClockIcon,
  FolderIcon,
  MoreVerticalIcon,
  PencilIcon,
  TrashIcon,
} from '../../../../components/icons'

const ProjectPreview = ({ project }) => {
  const initial = project.name.trim().slice(0, 1).toLocaleUpperCase('vi') || 'P'
  const colorClass = [
    'from-violet-500/25 via-blue-500/10 to-cyan-400/20',
    'from-cyan-400/20 via-violet-500/10 to-fuchsia-500/20',
    'from-blue-500/20 via-cyan-400/10 to-violet-500/25',
  ][project.previewType || 0]

  return (
    <div className={`absolute inset-0 overflow-hidden bg-gradient-to-br ${colorClass} project-preview-grid`}>
      <div className="absolute -left-10 -top-10 h-36 w-36 rounded-full bg-violet-400/10 blur-2xl" />
      <div className="absolute -bottom-12 -right-8 h-40 w-40 rounded-full bg-cyan-300/10 blur-2xl" />
      <div className="absolute left-5 top-5 flex items-center gap-2 font-mono text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--bd-dim)]">
        <FolderIcon size={14} />
        Dự án
      </div>
      <div className="absolute inset-0 grid place-items-center">
        <div className="grid h-20 w-20 place-items-center rounded-2xl border border-white/10 bg-[var(--bd-panel-solid)]/85 text-3xl font-semibold text-[var(--bd-accent)] shadow-2xl backdrop-blur">
          {initial}
        </div>
      </div>
    </div>
  )
}

function formatUpdatedAt(value) {
  if (!value) return 'Chưa rõ thời gian cập nhật'

  const updatedAt = new Date(value)
  if (Number.isNaN(updatedAt.getTime())) return 'Chưa rõ thời gian cập nhật'

  const date = new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(updatedAt)
  const time = new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(updatedAt)

  return `Cập nhật ${time} · ${date}`
}

const ProjectCard = ({ project, onOpen, onRename, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const menuTriggerRef = useRef(null)

  useEffect(() => {
    if (!isMenuOpen) return undefined

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setIsMenuOpen(false)
    }
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return
      setIsMenuOpen(false)
      menuTriggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] text-left shadow-[0_18px_45px_-30px_rgba(0,0,0,.65)] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/45 hover:shadow-[0_24px_55px_-28px_rgba(34,211,238,.35)] focus-within:border-violet-400/45"
    >
      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-inset focus:ring-violet-300"
        aria-label={`Mở dự án ${project.name}`}
      />

      <div className="relative h-44 overflow-hidden border-b border-[var(--bd-border)]">
        <ProjectPreview project={project} />

        <div ref={menuRef} className="absolute right-3 top-3 z-30">
          <button
            ref={menuTriggerRef}
            type="button"
            onClick={(event) => {
              event.stopPropagation()
              setIsMenuOpen((open) => !open)
            }}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-[var(--bd-panel-solid)]/90 text-[var(--bd-dim)] shadow-lg backdrop-blur transition hover:text-[var(--bd-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
            aria-label={`Mở menu dự án ${project.name}`}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-controls={`project-actions-${project.id}`}
          >
            <MoreVerticalIcon size={18} />
          </button>

          {isMenuOpen && (
            <div
              id={`project-actions-${project.id}`}
              role="menu"
              aria-label={`Thao tác dự án ${project.name}`}
              className="absolute right-0 top-11 w-44 overflow-hidden rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] p-1.5 shadow-2xl shadow-black/40"
            >
              <button
                type="button"
                role="menuitem"
                onClick={(event) => {
                  event.stopPropagation()
                  setIsMenuOpen(false)
                  onRename()
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[var(--bd-text)] transition hover:bg-[var(--bd-fill-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-400/70"
              >
                <PencilIcon size={16} />
                Đổi tên
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={(event) => {
                  event.stopPropagation()
                  setIsMenuOpen(false)
                  onDelete()
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-400/70"
              >
                <TrashIcon size={16} />
                Xóa dự án
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-5">
        <h3
          className="truncate text-xl font-semibold text-[var(--bd-text)] transition group-hover:text-[var(--bd-info)]"
          title={project.name}
        >
          {project.name}
        </h3>
        <p className="mt-3 flex items-center gap-2 text-xs text-[var(--bd-dim)]">
          <ClockIcon size={14} aria-hidden="true" />
          {formatUpdatedAt(project.updatedAt)}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-[var(--bd-border)] pt-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--bd-muted)]">
            Landing Page
          </span>
          <span className="text-sm font-semibold text-[var(--bd-accent)] transition group-hover:translate-x-0.5">
            Mở dự án →
          </span>
        </div>
      </div>
    </article>
  )
}

export default ProjectCard
