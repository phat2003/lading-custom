import { PlusIcon, DownloadIcon } from '../../../components/icons'
import PlanCard from './components/PlanCard'
import FeatureComparison from './components/FeatureComparison'
import { plans, comparison } from '../mock/plans'

export default function PricingPlans() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Gói dịch vụ &amp; Thanh toán</h1>
        <p className="mt-1 text-sm text-slate-400">
          Cấu hình và quản lý chiến lược doanh thu của nền tảng. Cân bằng các tính năng
          giữa các gói để tối ưu hóa chuyển đổi.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {plans.map((p) => (
          <PlanCard key={p.id} plan={p} onEdit={() => {}} />
        ))}
        <button className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-700 p-6 text-center hover:border-slate-500">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 text-slate-400">
            <PlusIcon size={20} />
          </span>
          <span className="font-medium text-slate-300">Thêm gói mới</span>
          <span className="text-xs text-slate-500">
            Tạo gói cấp độ tùy chỉnh mới cho các quy tắc và tính năng cụ thể.
          </span>
        </button>
      </div>

      <div>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">So sánh tính năng</h2>
            <p className="text-sm text-slate-400">
              Phân tích chi tiết định mức và quyền hạn của từng gói.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800">
            <DownloadIcon size={16} /> Xuất CSV
          </button>
        </div>
        <div className="mt-4">
          <FeatureComparison columns={comparison.columns} rows={comparison.rows} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">
          Hủy thay đổi
        </button>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
          Lưu tất cả
        </button>
      </div>
    </div>
  )
}
