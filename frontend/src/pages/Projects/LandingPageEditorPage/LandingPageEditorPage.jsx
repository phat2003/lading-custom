import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  EyeIcon,
  ImageIcon,
  LayoutTemplateIcon,
  MonitorIcon,
  PlusIcon,
  SmartphoneIcon,
  TabletIcon,
} from '../../../components/icons'
import { useProjects } from '../context/ProjectsContext'
import StatusNotice from '../components/StatusNotice'

const VIEWPORTS = {
  desktop: { width: '100%', icon: MonitorIcon, label: 'Desktop' },
  tablet: { width: '760px', icon: TabletIcon, label: 'Tablet' },
  mobile: { width: '390px', icon: SmartphoneIcon, label: 'Mobile' },
}

const ELEMENT_GROUPS = [
  {
    title: 'Bố cục & Sections',
    items: [
      { label: 'Section', icon: '▤' },
      { label: 'Cột', icon: '▥' },
    ],
  },
  {
    title: 'Cơ bản',
    items: [
      { label: 'Tiêu đề', icon: 'T' },
      { label: 'Văn bản', icon: '≡' },
      { label: 'Hình ảnh', component: ImageIcon },
      { label: 'Nút bấm', icon: '▣' },
    ],
  },
]

export default function LandingPageEditorPage() {
  const { projectId, landingPageId } = useParams()
  const navigate = useNavigate()
  const { getProject, getLandingPage } = useProjects()
  const project = getProject(projectId)
  const landingPage = getLandingPage(projectId, landingPageId)
  const [viewport, setViewport] = useState('desktop')
  const [zoom, setZoom] = useState(100)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!notice) return undefined
    const timer = window.setTimeout(() => setNotice(''), 3000)
    return () => window.clearTimeout(timer)
  }, [notice])

  const canvasStyle = useMemo(
    () => ({
      width: VIEWPORTS[viewport].width,
      transform: `scale(${zoom / 100})`,
      transformOrigin: 'top center',
    }),
    [viewport, zoom],
  )

  if (!project || !landingPage) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0e0e10] px-4 text-white">
        <section className="max-w-lg rounded-2xl border border-white/10 bg-[#201f21] p-8 text-center">
          <h1 className="text-3xl font-semibold">Không tìm thấy Landing Page</h1>
          <button
            type="button"
            onClick={() => navigate('/projects')}
            className="mt-6 rounded-lg bg-[#b4c5ff] px-5 py-3 font-semibold text-[#002a78]"
          >
            Quay lại My Project
          </button>
        </section>
      </main>
    )
  }

  const hasStarterContent = landingPage.sourceType !== 'blank'

  return (
    <div className="flex h-screen min-w-[1000px] flex-col overflow-hidden bg-[#0e0e10] text-[#e5e1e4]">
      <header className="z-50 flex h-16 shrink-0 items-center justify-between border-b border-[#434655]/20 bg-[#201f21] px-5">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => navigate(`/projects/${projectId}/templates`)}
            className="flex items-center gap-2 text-white"
            title="Quay lại Kho Giao Diện"
          >
            <span className="grid h-7 w-7 grid-cols-2 gap-0.5">
              <span className="bg-white" />
              <span className="bg-white" />
              <span className="bg-white" />
              <span className="bg-white" />
            </span>
            <span className="text-lg font-bold">Myproject</span>
            <span className="rounded border border-white/10 bg-[#353437] px-2 py-1 font-mono text-[9px] text-[#c3c6d7]">
              FREE
            </span>
          </button>
          <div className="h-7 w-px bg-white/10" />
          <div className="flex gap-2 text-[#c3c6d7]">
            <button
              type="button"
              onClick={() => setNotice('Undo chưa được kết nối trong task frontend này.')}
              className="rounded p-2 transition hover:bg-white/5 hover:text-white"
              title="Undo"
            >
              ↶
            </button>
            <button
              type="button"
              onClick={() => setNotice('Redo chưa được kết nối trong task frontend này.')}
              className="rounded p-2 transition hover:bg-white/5 hover:text-white"
              title="Redo"
            >
              ↷
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="max-w-[300px] truncate font-mono text-xs text-[#c3c6d7]">
            Dự án: <span className="text-white">{landingPage.name}</span>⌄
          </p>
          <div className="h-6 w-px bg-white/10" />
          <button
            type="button"
            onClick={() => setNotice('Preview sẽ được triển khai ở task tiếp theo.')}
            className="rounded border border-white/10 px-4 py-2 font-mono text-xs text-white transition hover:border-[#b4c5ff]/50 hover:text-[#b4c5ff]"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={() => setNotice('Publish cần tích hợp API ở task riêng.')}
            className="rounded bg-[#eec200] px-5 py-2 font-semibold text-[#231b00] shadow-[0_0_20px_rgba(238,194,0,0.2)] transition hover:bg-[#ffe083]"
          >
            Xuất bản
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[280px] shrink-0 flex-col border-r border-white/5 bg-[#201f21]">
          <div className="border-b border-white/5 p-5">
            <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              Thành phần
            </h2>
            <p className="mt-2 text-xs text-[#c3c6d7]">Kéo thả để thêm vào canvas</p>
          </div>

          <div className="flex-1 space-y-7 overflow-y-auto p-5">
            {ELEMENT_GROUPS.map((group) => (
              <section key={group.title}>
                <h3 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-[#eec200]">
                  {group.title}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {group.items.map((item) => {
                    const ItemIcon = item.component
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setNotice(`${item.label}: kéo thả sẽ được làm ở task Editor.`)}
                        className="flex h-24 flex-col items-center justify-center gap-3 rounded-lg border border-white/5 bg-[#2a2a2c] text-[#c3c6d7] transition hover:border-[#b4c5ff]/50 hover:text-[#b4c5ff]"
                      >
                        {ItemIcon ? <ItemIcon size={24} /> : <span className="text-2xl">{item.icon}</span>}
                        <span className="text-xs text-white">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </section>
            ))}

            <section>
              <h3 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-widest text-[#eec200]">
                Nâng cao
              </h3>
              <div className="space-y-2">
                {['Video Player', 'Form liên hệ'].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setNotice(`${item} yêu cầu gói Pro.`)}
                    className="flex w-full items-center gap-3 rounded-lg border border-white/5 bg-[#2a2a2c] px-4 py-3 text-left text-xs text-[#8d90a0] opacity-60"
                  >
                    <EyeIcon size={18} />
                    {item}
                    <span className="ml-auto">⌑</span>
                  </button>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-3 p-5">
            <div className="rounded-lg border border-[#eec200]/35 bg-[#eec200]/10 p-3">
              <p className="text-xs font-semibold text-white">Mở khóa tính năng cao cấp</p>
              <button
                type="button"
                onClick={() => setNotice('Luồng nâng cấp Pro nằm ngoài task hiện tại.')}
                className="mt-3 w-full rounded bg-[#eec200] py-2 text-xs font-bold text-[#231b00]"
              >
                Nâng cấp Pro
              </button>
            </div>
            <div className="rounded border border-[#b4c5ff]/20 bg-[#2563eb]/10 p-3">
              <p className="text-xs font-bold text-[#b4c5ff]">💡 Mẹo nhỏ</p>
              <p className="mt-1 text-[10px] leading-relaxed text-[#c3c6d7]">
                Giữ phím Shift để kéo các thành phần theo đường thẳng.
              </p>
            </div>
          </div>
        </aside>

        <main className="editor-canvas-grid relative min-w-0 flex-1 overflow-auto px-8 pb-28 pt-28">
          <div className="fixed left-1/2 top-20 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-[#252a3a]/95 px-4 py-2 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-1">
              {Object.entries(VIEWPORTS).map(([key, option]) => {
                const ViewportIcon = option.icon
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setViewport(key)}
                    className={`rounded-full p-2 transition ${
                      viewport === key
                        ? 'bg-[#2563eb] text-white'
                        : 'text-[#c3c6d7] hover:text-white'
                    }`}
                    aria-label={option.label}
                  >
                    <ViewportIcon size={18} />
                  </button>
                )
              })}
            </div>
            <div className="h-5 w-px bg-white/15" />
            <button
              type="button"
              onClick={() => setZoom((current) => Math.max(60, current - 10))}
              className="px-1 text-[#c3c6d7]"
            >
              −
            </button>
            <span className="w-12 text-center font-mono text-xs text-white">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((current) => Math.min(120, current + 10))}
              className="px-1 text-[#c3c6d7]"
            >
              +
            </button>
          </div>

          <div className="mx-auto min-h-[850px] max-w-[1000px] transition-all duration-300" style={canvasStyle}>
            <div className="min-h-[800px] bg-white p-12 text-[#0e0e10] shadow-2xl sm:p-16">
              {hasStarterContent && (
                <section className="mx-auto max-w-3xl rounded border border-dashed border-[#b4c5ff] bg-[#2563eb]/5 px-8 py-14 text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#2563eb]/10 text-[#2563eb]">
                    <LayoutTemplateIcon size={30} />
                  </div>
                  <h1 className="mt-7 text-4xl font-bold">Mẫu Hero Section</h1>
                  <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-[#5d6472]">
                    Đây là ví dụ về một khối nội dung bạn có thể tùy chỉnh. Nhấp vào các phần tử để thay đổi thuộc tính bên phải.
                  </p>
                  <button
                    type="button"
                    className="mt-8 rounded-lg bg-[#2563eb] px-8 py-3 font-bold text-white shadow-[0_8px_25px_rgba(37,99,235,0.25)]"
                  >
                    Khám phá ngay
                  </button>
                </section>
              )}

              <button
                type="button"
                onClick={() => setNotice('Thư viện Section sẽ được triển khai trong task Editor.')}
                className={`${hasStarterContent ? 'mt-16' : ''} flex min-h-[320px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#c7cad2] text-[#b5b9c3] transition hover:border-[#b4c5ff] hover:text-[#8d90a0]`}
              >
                <PlusIcon size={52} />
                <span className="mt-5 text-2xl font-bold">Bắt đầu thiết kế</span>
                <span className="mt-2 text-sm">Kéo một Section vào đây để khởi tạo trang web của bạn</span>
              </button>
            </div>
          </div>
        </main>

        <aside className="w-[280px] shrink-0 overflow-y-auto border-l border-white/5 bg-[#201f21]">
          <div className="flex border-b border-white/5">
            {['Thiết kế', 'Cài đặt', 'Lớp'].map((tab, index) => (
              <button
                key={tab}
                type="button"
                className={`flex-1 py-4 font-mono text-xs ${
                  index === 0
                    ? 'border-b-2 border-[#b4c5ff] text-[#b4c5ff]'
                    : 'text-[#c3c6d7]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-8 p-5">
            <section>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white">Kiểu chữ</h2>
                <span>⚙</span>
              </div>
              <label className="mt-5 block font-mono text-[10px] uppercase tracking-wider text-[#c3c6d7]">
                Font family
                <select className="mt-2 w-full rounded border border-white/5 bg-[#2a2a2c] p-3 text-sm text-white">
                  <option>Inter (Mặc định)</option>
                </select>
              </label>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <label className="font-mono text-[10px] uppercase tracking-wider text-[#c3c6d7]">
                  Cỡ chữ
                  <input value="16" readOnly className="mt-2 w-full rounded border border-white/5 bg-[#2a2a2c] p-3 text-white" />
                </label>
                <label className="font-mono text-[10px] uppercase tracking-wider text-[#c3c6d7]">
                  Trọng lượng
                  <select className="mt-2 w-full rounded border border-white/5 bg-[#2a2a2c] p-3 text-white">
                    <option>Mặc định</option>
                  </select>
                </label>
              </div>
              <div className="mt-4 grid grid-cols-4 overflow-hidden rounded bg-[#2a2a2c]">
                {['≡', '≣', '≡', '≣'].map((item, index) => (
                  <button
                    key={`${item}-${index}`}
                    type="button"
                    className={`py-3 ${index === 1 ? 'bg-[#2563eb] text-white' : 'text-[#c3c6d7]'}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </section>

            <section className="border-t border-white/5 pt-6">
              <h2 className="font-semibold text-white">Khoảng cách & Kích thước</h2>
              <div className="mt-4 grid h-32 place-items-center rounded-lg border border-dashed border-white/10 bg-[#2a2a2c] font-mono text-[10px] text-[#c3c6d7]">
                MARGIN · PADDING
              </div>
            </section>

            <section className="border-t border-white/5 pt-6">
              <h2 className="font-semibold text-white">Màu sắc</h2>
              <div className="mt-4 space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded bg-[#f8fafc]" />
                  <span>Nền chính</span>
                  <span className="ml-auto font-mono text-[10px] text-[#c3c6d7]">#F8FAFC</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded bg-[#0f172a]" />
                  <span>Văn bản</span>
                  <span className="ml-auto font-mono text-[10px] text-[#c3c6d7]">#0F172A</span>
                </div>
              </div>
            </section>
          </div>
        </aside>
      </div>

      <StatusNotice>{notice}</StatusNotice>
    </div>
  )
}
