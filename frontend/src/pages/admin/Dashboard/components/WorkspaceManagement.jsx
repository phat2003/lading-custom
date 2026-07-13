import Badge from '../../../../components/common/Badge'
import { PlusIcon } from '../../../../components/icons'
import ProjectCard from './ProjectCard'

// Khu "Workspace Management" — lưới các project.
export default function WorkspaceManagement({ projects = [] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#111725] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-white">Workspace Management</h2>
          <Badge color="green">{projects.length} projects</Badge>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500">
          <PlusIcon size={16} /> New Project
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>
    </div>
  )
}
