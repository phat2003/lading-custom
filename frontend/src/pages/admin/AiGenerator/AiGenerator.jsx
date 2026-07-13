import { useState } from 'react'
import { ZapIcon, ImageIcon } from '../../../components/icons'
import Badge from '../../../components/common/Badge'
import TemplateTypeSelector from './components/TemplateTypeSelector'
import QuickStyles from './components/QuickStyles'
import CreditsCard from './components/CreditsCard'
import GenerationHistory from './components/GenerationHistory'
import { quickStyles, credits, aiHistory } from '../mock/aiGenerator'

export default function AiGenerator() {
  const [type, setType] = useState('landing')
  const [prompt, setPrompt] = useState('')

  return (
    <div className="space-y-8">
      <div>
        <Badge color="purple">Truy cập Beta</Badge>
        <h1 className="mt-2 text-3xl font-bold text-white">Không gian thiết kế AI</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-400">
          Biến ý tưởng thành các mẫu thiết kế hoàn chỉnh trong giây lát. Tận dụng sức mạnh
          của AI cho dự án tiếp theo của bạn.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-[#111725] p-5 lg:col-span-2">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Loại template
          </p>
          <TemplateTypeSelector value={type} onChange={setType} />

          <p className="mb-2 mt-5 text-xs font-medium uppercase tracking-wide text-slate-500">
            Gợi ý thiết kế
          </p>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder="Mô tả ý tưởng của bạn (ví dụ: 'Một trang landing page SaaS hiện đại cho ứng dụng Fintech với hiệu ứng glassmorphism tối và các điểm nhấn neon rực rỡ...')"
              className="w-full resize-none rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-200 placeholder-slate-500 focus:border-slate-600 focus:outline-none"
            />
            <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-slate-600">
              Hỗ trợ Markdown &amp; Styles
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <button className="inline-flex items-center gap-1 hover:text-slate-200">
                <ImageIcon size={16} /> Thêm tham chiếu
              </button>
              <button className="hover:text-slate-200">Chọn bảng màu</button>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
              Tạo với AI <ZapIcon size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <QuickStyles styles={quickStyles} />
          <CreditsCard used={credits.used} total={credits.total} />
        </div>
      </div>

      <GenerationHistory history={aiHistory} />
    </div>
  )
}
