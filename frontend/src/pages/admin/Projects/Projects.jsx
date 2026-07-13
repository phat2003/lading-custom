import { useState } from 'react'
import { PlusIcon } from '../../../components/icons'
import ConfirmDialog from '../components/ConfirmDialog'
import ProjectTable from './components/ProjectTable'
import { projects as mockProjects } from '../mock/projects'
// Khi backend có endpoint admin: import { projectsApi } from '../../../api/projects'

const TOTAL_ACTIVE = 24 // tổng dự án đang hoạt động (mock cho phần phân trang)

export default function Projects() {
  const [items, setItems] = useState(mockProjects)
  const [deleting, setDeleting] = useState(null)

  const handleDelete = () => {
    // TODO(API): await projectsApi.remove(deleting.id)
    setItems((list) => list.filter((p) => p.id !== deleting.id))
    setDeleting(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dự án</h1>
          <p className="mt-1 text-sm text-slate-400">
            Giám sát các bản triển khai đang hoạt động và việc sử dụng mẫu trong studio của bạn.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500">
          <PlusIcon size={16} /> Tạo Dự án
        </button>
      </div>

      <ProjectTable
        projects={items}
        onView={() => {}}
        onDelete={setDeleting}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Đang hiển thị {items.length} trong số {TOTAL_ACTIVE} dự án đang hoạt động
        </p>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800">
            Trước
          </button>
          <button className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800">
            Tiếp
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Xóa Dự án"
        message={
          deleting
            ? `Bạn có chắc muốn xóa dự án "${deleting.name}" của ${deleting.owner}?`
            : ''
        }
        confirmText="Xóa"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
