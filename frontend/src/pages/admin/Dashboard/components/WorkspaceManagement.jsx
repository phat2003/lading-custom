import Badge from '../../../../components/common/Badge'
import ProjectCard from './ProjectCard'

// Khu "Workspace Management" — lưới các project của toàn hệ thống.
// Admin chỉ THEO DÕI, không tạo dự án hộ người dùng nên không có nút tạo mới.
export default function WorkspaceManagement({ projects = [] }) {
  return (
    <div className="rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] p-5">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-[var(--bd-text)]">Workspace Management</h2>
        <Badge color="green">{projects.length} projects</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  )
}
