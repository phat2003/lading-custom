import { RefreshCwIcon } from '../../../components/icons'
import StatCard from './components/StatCard'
import RecentUsersTable from './components/RecentUsersTable'
import AiGeneratorLog from './components/AiGeneratorLog'
import WorkspaceManagement from './components/WorkspaceManagement'
import { stats } from '../mock/stats'
import { users } from '../mock/users'
import { aiLogs } from '../mock/aiLogs'
import { workspaceProjects } from '../mock/projects'

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Overview
          </p>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800">
          <RefreshCwIcon size={16} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Recent users + AI log */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentUsersTable users={users.slice(0, 5)} />
        </div>
        <AiGeneratorLog logs={aiLogs} />
      </div>

      {/* Workspace */}
      <WorkspaceManagement projects={workspaceProjects} />
    </div>
  )
}
