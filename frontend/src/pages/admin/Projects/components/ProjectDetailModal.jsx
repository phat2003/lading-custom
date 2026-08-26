import { useState } from 'react'
import AdminModal from '../../components/AdminModal'
import Avatar from '../../../../components/common/Avatar'
import Badge from '../../../../components/common/Badge'
import {
  CopyIcon,
  CheckIcon,
  GlobeIcon,
  LayoutTemplateIcon,
  FolderIcon,
  CalendarIcon,
} from '../../../../components/icons'

const STATUS = {
  published: { label: 'Đã xuất bản', color: 'green' },
  draft: { label: 'Bản nháp', color: 'amber' },
}

// Một dòng thông tin: nhãn bên trái, nội dung bên phải.
const Row = ({ icon, label, children }) => (
  <div className="flex items-start gap-3 border-t border-[var(--bd-border)] py-3 first:border-t-0 first:pt-0">
    <span className="mt-0.5 text-[var(--bd-muted)]">{icon}</span>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--bd-muted)]">
        {label}
      </p>
      <div className="mt-1 text-sm text-[var(--bd-text)]">{children}</div>
    </div>
  </div>
)

// Nút chép ID — báo "Đã chép" 1,5 giây rồi trả lại trạng thái cũ.
const CopyButton = ({ value }) => {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Trình duyệt chặn clipboard (thường do không chạy HTTPS) — bỏ qua im lặng,
      // người dùng vẫn bôi đen chép tay được vì ID hiển thị đầy đủ.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title="Chép ID"
      className="shrink-0 rounded-md p-1 text-[var(--bd-muted)] transition-colors hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]"
    >
      {copied ? <CheckIcon size={14} className="text-[var(--bd-ok)]" /> : <CopyIcon size={14} />}
    </button>
  )
}

const ProjectDetailModal = ({ project, onClose, onDelete }) => {
  if (!project) return null

  const status = STATUS[project.status] || { label: project.status, color: 'gray' }
  // published_url chỉ là slug; link công khai do backend phục vụ ở /p/:slug.
  const publicUrl = project.publishedUrl ? `/p/${project.publishedUrl}` : null

  return (
    <AdminModal open onClose={onClose} title="Chi tiết dự án" maxWidth="max-w-lg">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold text-[var(--bd-text)]">{project.name}</h3>
          <div className="mt-1 flex items-center gap-1">
            <span className="truncate font-mono text-xs text-[var(--bd-muted)]">
              {project.id}
            </span>
            <CopyButton value={project.id} />
          </div>
        </div>
        <Badge color={status.color}>{status.label}</Badge>
      </div>

      <div className="rounded-xl border border-[var(--bd-border)] bg-[var(--bd-fill)] px-4 py-1">
        <Row icon={<Avatar name={project.owner} size="sm" />} label="Người sở hữu">
          <p className="font-medium">{project.owner}</p>
          <p className="text-[var(--bd-dim)]">{project.email}</p>
        </Row>

        <Row icon={<LayoutTemplateIcon size={16} />} label="Template sử dụng">
          <Badge color="gray">{project.template}</Badge>
        </Row>

        <Row icon={<FolderIcon size={16} />} label="Landing page bên trong">
          {project.pageCount ?? 0} trang
        </Row>

        <Row icon={<GlobeIcon size={16} />} label="Link công khai">
          {publicUrl ? (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-mono text-[var(--bd-accent)] hover:underline"
            >
              {publicUrl}
            </a>
          ) : (
            <span className="text-[var(--bd-muted)]">Chưa xuất bản</span>
          )}
        </Row>

        <Row icon={<CalendarIcon size={16} />} label="Thời gian">
          <p>
            Tạo: <span className="text-[var(--bd-dim)]">{project.createdAt || '—'}</span>
          </p>
          <p>
            Cập nhật: <span className="text-[var(--bd-dim)]">{project.updatedAt || '—'}</span>
          </p>
        </Row>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="ad-btn-ghost"
        >
          Đóng
        </button>
        <button
          type="button"
          onClick={() => {
            onClose()
            onDelete?.(project)
          }}
          className="ad-btn-danger"
        >
          Xóa dự án
        </button>
      </div>
    </AdminModal>
  )
}

export default ProjectDetailModal
