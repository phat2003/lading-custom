import { useCallback, useEffect, useState } from 'react'
import { ZapIcon, ImageIcon, AlertTriangleIcon } from '../../../components/icons'
import Badge from '../../../components/common/Badge'
import TemplateTypeSelector from './components/TemplateTypeSelector'
import QuickStyles from './components/QuickStyles'
import CreditsCard from './components/CreditsCard'
import GenerationHistory from './components/GenerationHistory'
import { aiApi } from '../../../api/ai'
import { errMsg } from '../adapters'
// quickStyles là danh sách gợi ý cố định của UI, không phải dữ liệu backend.
import { quickStyles } from '../mock/aiGenerator'

const HISTORY_LIMIT = 20

// Nhãn nhóm ngày cho lịch sử: Hôm nay / Hôm qua / dd/mm/yyyy.
const dayLabel = (iso) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'Không rõ'

  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diffDays = (startOf(new Date()) - startOf(d)) / 86400000

  if (diffDays === 0) return 'Hôm nay'
  if (diffDays === 1) return 'Hôm qua'
  return d.toLocaleDateString('vi-VN')
}

const timeLabel = (iso) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

// API trả mảng phẳng; GenerationHistory cần nhóm theo ngày.
// Giữ nguyên thứ tự API (mới nhất trước) nên các nhóm cũng đã đúng thứ tự.
const groupByDay = (items) => {
  const groups = []
  items.forEach((item) => {
    const day = dayLabel(item.created_at)
    let group = groups.find((g) => g.day === day)
    if (!group) {
      group = { day, items: [] }
      groups.push(group)
    }
    group.items.push({
      id: item.generation_id,
      prompt: item.prompt,
      time: timeLabel(item.created_at),
      tokens: item.tokens_used || undefined,
      note: item.status === 'generating' ? 'Đang xử lý...' : item.error_message || undefined,
      status: item.status,
    })
  })
  return groups
}

const AiGenerator = () => {
  const [type, setType] = useState('landing')
  const [style, setStyle] = useState('')
  const [prompt, setPrompt] = useState('')

  const [credits, setCredits] = useState({ used: 0, total: 0, reset_at: null })
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const fetchData = useCallback(async (signal) => {
    setLoading(true)
    setError('')
    try {
      const [creditsRes, historyRes] = await Promise.all([
        aiApi.credits({ signal }),
        aiApi.history({ page: 1, limit: HISTORY_LIMIT }, { signal }),
      ])
      setCredits(creditsRes.data.data)
      setHistory(groupByDay(historyRes.data.data || []))
    } catch (err) {
      if (err.name === 'CanceledError') return // request cũ bị hủy, bỏ qua
      setError(errMsg(err, 'Không tải được dữ liệu AI.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchData(controller.signal)
    return () => controller.abort()
  }, [fetchData])

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return

    setGenerating(true)
    setError('')
    try {
      await aiApi.generate({
        prompt: prompt.trim(),
        template_type: type,
        style: style || undefined,
      })
      setPrompt('')
      await fetchData() // nạp lại lịch sử + hạn mức đã trừ
    } catch (err) {
      // 403 = AI tắt hoặc hết hạn mức, 429 = quá trần theo ngày.
      setError(errMsg(err, 'Tạo thiết kế thất bại.'))
    } finally {
      setGenerating(false)
    }
  }

  const outOfCredits = credits.total > 0 && credits.used >= credits.total

  return (
    <div className="space-y-8">
      <div>
        <Badge color="purple">Truy cập Beta</Badge>
        <h1 className="mt-2 text-3xl font-bold text-[var(--bd-text)]">Không gian thiết kế AI</h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--bd-dim)]">
          Biến ý tưởng thành các mẫu thiết kế hoàn chỉnh trong giây lát. Tận dụng sức mạnh
          của AI cho dự án tiếp theo của bạn.
        </p>
      </div>

      {/* Backend chưa gọi mô hình AI nào nên mọi lượt tạo đều kết thúc ở trạng
          thái "Thất bại". Báo trước để người dùng không tưởng là lỗi hệ thống. */}
      <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-300/90">
        <AlertTriangleIcon size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-medium">Chế độ thử nghiệm — chưa tích hợp mô hình AI</p>
          <p className="mt-0.5 text-amber-300/70">
            Yêu cầu được ghi vào lịch sử nhưng hệ thống{' '}
            <strong>chưa sinh ra thiết kế nào</strong>, nên mọi lượt tạo sẽ hiện là
            &ldquo;Thất bại&rdquo;. Hạn mức của bạn <strong>không bị trừ</strong>. Phần gọi
            mô hình sẽ được bổ sung sau.
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] p-5 lg:col-span-2">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--bd-muted)]">
            Loại template
          </p>
          <TemplateTypeSelector value={type} onChange={setType} />

          <p className="mb-2 mt-5 text-xs font-medium uppercase tracking-wide text-[var(--bd-muted)]">
            Gợi ý thiết kế
          </p>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              placeholder="Mô tả ý tưởng của bạn (ví dụ: 'Một trang landing page SaaS hiện đại cho ứng dụng Fintech với hiệu ứng glassmorphism tối và các điểm nhấn neon rực rỡ...')"
              className="w-full resize-none rounded-lg border border-[var(--bd-border)] bg-[var(--bd-fill)] p-3 text-sm text-[var(--bd-text)] placeholder:text-[var(--bd-muted)] focus:border-[var(--bd-border)] focus:outline-none"
            />
            <span className="pointer-events-none absolute bottom-2 right-3 text-xs text-[var(--bd-muted)]">
              {style ? `Phong cách: ${style}` : 'Hỗ trợ Markdown & Styles'}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-sm text-[var(--bd-dim)]">
              {/* Chưa nối: không có endpoint upload ảnh tham chiếu cho AI */}
              <button className="inline-flex items-center gap-1 hover:text-[var(--bd-text)]">
                <ImageIcon size={16} /> Thêm tham chiếu
              </button>
              <button className="hover:text-[var(--bd-text)]">Chọn bảng màu</button>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating || loading || !prompt.trim() || outOfCredits}
              title={outOfCredits ? 'Bạn đã dùng hết hạn mức AI' : undefined}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-medium text-white shadow-[0_0_20px_-6px_rgba(139,92,246,.9)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_26px_-2px_rgba(139,92,246,1)] disabled:opacity-50"
            >
              {generating ? 'Đang tạo...' : 'Tạo với AI'} <ZapIcon size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <QuickStyles styles={quickStyles} active={style} onSelect={setStyle} />
          <CreditsCard used={credits.used} total={credits.total} resetAt={credits.reset_at} />
        </div>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)]" />
      ) : history.length === 0 ? (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-[var(--bd-text)]">Lịch sử khởi tạo</h2>
          <p className="rounded-xl border border-[var(--bd-border)] bg-[var(--bd-panel-solid)] px-5 py-10 text-center text-sm text-[var(--bd-muted)]">
            Chưa có lượt tạo nào.
          </p>
        </div>
      ) : (
        <GenerationHistory history={history} />
      )}
    </div>
  )
}

export default AiGenerator
