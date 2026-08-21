import { useEffect, useState } from 'react'
import BlockRenderer from './components/BlockRenderer'
import { MonitorIcon, SmartphoneIcon } from '../../../components/icons'
import { viewAll } from './deviceLayout'

// Khoá dùng để chuyển dữ liệu sang cửa sổ xem trước.
// Dùng localStorage vì tab mở bằng window.open không chắc chắn kế thừa
// sessionStorage trên mọi trình duyệt.
export const PREVIEW_KEY = 'builderPreview'

const PAGE_WIDTH = { desktop: 896, mobile: 390 }

// Style của một phần tử — giữ đúng logic dựng khung của CanvasElement,
// nhưng bỏ hết phần tương tác (kéo, resize, chọn).
const boxStyle = (el) => {
  const s = el.style || {}
  return {
    position: 'absolute',
    left: el.x,
    top: el.y,
    width: s.width,
    height: s.height,
    opacity: s.opacity,
    padding: s.padding,
    borderRadius: s.borderRadius,
    boxShadow: s.boxShadow,
    border: s.borderWidth
      ? `${s.borderWidth}px ${s.borderStyle || 'solid'} ${s.borderColor || '#000000'}`
      : undefined,
    backgroundImage: s.backgroundImage ? `url(${s.backgroundImage})` : undefined,
    backgroundSize: s.backgroundImage ? 'cover' : undefined,
    backgroundPosition: s.backgroundImage ? 'center' : undefined,
  }
}

// Vẽ 1 phần tử + các phần tử con (nếu là Section).
const PreviewElement = ({ element, elements }) => {
  if (element.hidden) return null
  const children = element.type === 'section' ? elements.filter((c) => c.parentId === element.id) : []

  return (
    <div style={boxStyle(element)}>
      <BlockRenderer element={element} />
      {children.map((c) => (
        <PreviewElement key={c.id} element={c} elements={elements} />
      ))}
    </div>
  )
}

// Trang xem trước toàn màn hình — mở ở cửa sổ mới từ nút "Xem trước" của builder.
const PreviewPage = () => {
  const [data, setData] = useState(null)
  const [viewportW, setViewportW] = useState(() => window.innerWidth)
  const [device, setDevice] = useState('desktop')

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREVIEW_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        setData(parsed)
        if (parsed.device) setDevice(parsed.device)
      }
    } catch {
      setData(null)
    }
    document.title = 'Xem trước template'
  }, [])

  // Áp "Thiết lập toàn trang": tiêu đề SEO, mã chèn thêm, khoá copy.
  useEffect(() => {
    const st = data?.settings
    if (!st) return

    if (st.seoTitle) document.title = st.seoTitle

    // Chèn CSS/JS người dùng nhập ở tab "Mã JavaScript/CSS".
    const injected = []
    const inject = (code, target) => {
      if (!code?.trim()) return
      const holder = document.createElement('div')
      holder.innerHTML = code
      Array.from(holder.childNodes).forEach((node) => {
        // <script> chèn qua innerHTML sẽ không chạy -> phải tạo lại thẻ.
        if (node.tagName === 'SCRIPT') {
          const sc = document.createElement('script')
          sc.textContent = node.textContent
          Array.from(node.attributes || []).forEach((a) => sc.setAttribute(a.name, a.value))
          target.appendChild(sc)
          injected.push(sc)
        } else {
          target.appendChild(node)
          injected.push(node)
        }
      })
    }
    inject(st.headCode, document.head)
    inject(st.bodyCode, document.body)

    // Bảo vệ trang: chặn chuột phải + bôi đen.
    const block = (e) => e.preventDefault()
    if (st.protectCopy) {
      document.addEventListener('contextmenu', block)
      document.addEventListener('selectstart', block)
      document.addEventListener('copy', block)
    }

    return () => {
      injected.forEach((n) => n.remove())
      document.removeEventListener('contextmenu', block)
      document.removeEventListener('selectstart', block)
      document.removeEventListener('copy', block)
    }
  }, [data])

  // Trang được thiết kế ở khổ cố định; phóng theo bề ngang cửa sổ để tràn viền
  // như trang thật. Đổi kích thước cửa sổ thì tỉ lệ tính lại theo.
  useEffect(() => {
    const onResize = () => setViewportW(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  if (!data?.elements?.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-8 text-center">
        <div>
          <p className="text-lg font-semibold text-slate-700">Chưa có nội dung để xem trước</p>
          <p className="mt-1.5 text-sm text-slate-500">
            Hãy quay lại trình dựng, thêm phần tử rồi bấm &quot;Xem trước&quot; lần nữa.
          </p>
        </div>
      </div>
    )
  }

  const { elements: rawElements, settings } = data
  // Dữ liệu gửi sang còn nguyên 2 lớp; hoà theo thiết bị đang chọn trong preview.
  const elements = viewAll(rawElements, device)
  // Khổ trang theo "Thiết lập toàn trang", chưa có thì dùng mặc định.
  const width =
    (device === 'mobile' ? settings?.mobileWidth : settings?.desktopWidth) ||
    PAGE_WIDTH[device] ||
    PAGE_WIDTH.desktop
  const topLevel = elements.filter((el) => !el.parentId)
  // Chiều cao trang = đáy của phần tử thấp nhất, chừa thêm chút lề.
  const height = Math.max(
    600,
    ...topLevel.map((el) => (el.y || 0) + (el.style?.height || 0) + 40),
  )

  // Desktop: phóng cho tràn viền như trang thật.
  // Mobile: giữ đúng khổ thật (không phóng to) để nhìn giống màn hình điện thoại,
  // chỉ thu lại nếu cửa sổ hẹp hơn khổ máy.
  const scale = device === 'mobile' ? Math.min(1, (viewportW - 32) / width) : viewportW / width

  return (
    // Khung ngoài giữ đúng chiều cao SAU khi phóng, nếu không sẽ dư/thiếu vùng cuộn.
    <div
      className={`min-h-screen w-full overflow-x-hidden ${
        device === 'mobile' ? 'flex justify-center bg-slate-200 py-6' : 'bg-white'
      }`}
    >
      {/* Nút đổi thiết bị ngay trong cửa sổ xem trước */}
      <div className="fixed right-4 top-4 z-50 flex items-center gap-1 rounded-xl border border-slate-300 bg-white/90 p-1 shadow-lg backdrop-blur">
        <button
          onClick={() => setDevice('desktop')}
          title="Xem bản máy tính"
          className={`rounded-lg p-2 transition-colors ${
            device === 'desktop' ? 'bg-violet-500 text-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <MonitorIcon size={16} />
        </button>
        <button
          onClick={() => setDevice('mobile')}
          title="Xem bản điện thoại"
          className={`rounded-lg p-2 transition-colors ${
            device === 'mobile' ? 'bg-violet-500 text-white' : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <SmartphoneIcon size={16} />
        </button>
      </div>

      <div
        style={{ width: device === 'mobile' ? width * scale : undefined, height: height * scale }}
        className={device === 'mobile' ? 'overflow-hidden rounded-[28px] shadow-2xl ring-8 ring-slate-800' : ''}
      >
        <div
          dir={settings?.direction || 'ltr'}
          className="relative overflow-hidden"
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            fontFamily: settings?.fontFamily,
            backgroundColor: settings?.bgColor || '#ffffff',
            backgroundImage: settings?.bgImage ? `url(${settings.bgImage})` : undefined,
            backgroundSize: settings?.bgImage ? 'cover' : undefined,
            backgroundPosition: 'center',
            userSelect: settings?.protectCopy ? 'none' : undefined,
          }}
        >
          {topLevel.map((el) => (
            <PreviewElement key={el.id} element={el} elements={elements} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default PreviewPage
