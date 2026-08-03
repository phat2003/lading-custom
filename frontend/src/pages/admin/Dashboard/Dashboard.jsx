import { useCallback, useEffect, useState } from 'react'
import { RefreshCwIcon } from '../../../components/icons'
import StatCard from './components/StatCard'
import RecentUsersTable from './components/RecentUsersTable'
import AiGeneratorLog from './components/AiGeneratorLog'
import WorkspaceManagement from './components/WorkspaceManagement'
import { statsApi } from '../../../api/stats'
import { usersApi } from '../../../api/users'
import { adminProjectsApi } from '../../../api/projects'
import { adminAiApi } from '../../../api/ai'
import { toUserUI, formatDate, errMsg } from '../adapters'

const RECENT_USERS_LIMIT = 5
const WORKSPACE_LIMIT = 4
const AI_LOG_LIMIT = 4

// Cấu hình 4 thẻ số liệu. key khớp đúng khối trong GET /admin/stats.
// note = dòng mô tả tĩnh, dùng khi chỉ số đó không có delta theo kỳ.
const CARDS = [
  { key: 'total_users', label: 'Total Users', valueClass: 'text-white' },
  { key: 'total_projects', label: 'Projects', valueClass: 'text-blue-400' },
  {
    key: 'total_sections',
    label: 'Total Sections',
    valueClass: 'text-teal-400',
    note: 'Across all templates',
  },
  {
    key: 'ai_generated',
    label: 'AI Generated Pages',
    valueClass: 'text-purple-400',
    note: 'Chưa có dữ liệu (API AI chưa làm)',
  },
]

const PERIOD_LABEL = { week: 'this week', month: 'this month' }

// { value: 24, delta: 3, delta_period: 'week' } -> "↑ +3 this week"
const deltaText = (metric, note) => {
  if (!metric || metric.delta == null) return note || ''
  const sign = metric.delta < 0 ? '↓ ' : '↑ +'
  return `${sign}${Math.abs(metric.delta)} ${PERIOD_LABEL[metric.delta_period] || ''}`.trim()
}

// Log AI -> dòng trong khối "AI Generator Log".
const toAiLogUI = (log) => ({
  id: log.generation_id,
  prompt: log.prompt,
  status: log.status,
  user: log.user?.full_name || log.user?.email || '—',
  time: new Date(log.created_at).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  }),
})

// Dự án -> thẻ trong Workspace Management.
const toProjectCardUI = (p) => ({
  id: p.project_id,
  name: p.name,
  // project không có cột domain: slug nằm ở landing_page.published_url.
  domain: p.published_url ? `/p/${p.published_url}` : 'Chưa publish',
  status: p.status === 'published' ? 'Published' : 'Draft',
  updated: `Cập nhật ${formatDate(p.updated_at)}`,
})

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [recentUsers, setRecentUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [aiLogs, setAiLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAll = useCallback(async (signal) => {
    setLoading(true)
    setError('')
    try {
      // 4 khối độc lập nhau -> gọi song song cho nhanh.
      const [statsRes, usersRes, projectsRes, aiLogsRes] = await Promise.all([
        statsApi.get({ signal }),
        usersApi.list({ page: 1, limit: RECENT_USERS_LIMIT }, { signal }),
        adminProjectsApi.list({ page: 1, limit: WORKSPACE_LIMIT }, { signal }),
        adminAiApi.logs({ limit: AI_LOG_LIMIT }, { signal }),
      ])
      setStats(statsRes.data.data)
      setRecentUsers((usersRes.data.data || []).map(toUserUI))
      setProjects((projectsRes.data.data || []).map(toProjectCardUI))
      setAiLogs((aiLogsRes.data.data || []).map(toAiLogUI))
    } catch (err) {
      if (err.name === 'CanceledError') return // request cũ bị hủy, bỏ qua
      setError(errMsg(err, 'Không tải được dữ liệu tổng quan.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchAll(controller.signal)
    return () => controller.abort()
  }, [fetchAll])

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
        <button
          onClick={() => fetchAll()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCwIcon size={16} /> {loading ? 'Đang tải...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((card) => {
          const metric = stats?.[card.key]
          return (
            <StatCard
              key={card.key}
              label={card.label}
              value={loading || !metric ? '—' : metric.value.toLocaleString('en-US')}
              delta={loading ? '' : deltaText(metric, card.note)}
              valueClass={card.valueClass}
            />
          )
        })}
      </div>

      {/* Recent users + AI log */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentUsersTable users={recentUsers} />
        </div>
        <AiGeneratorLog logs={aiLogs} />
      </div>

      {/* Workspace */}
      <WorkspaceManagement projects={projects} />
    </div>
  )
}

export default Dashboard
