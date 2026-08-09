import { useEffect, useState } from 'react'
import BlockRenderer from './components/BlockRenderer'

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREVIEW_KEY)
      if (raw) setData(JSON.parse(raw))
    } catch {
      setData(null)
    }
    document.title = 'Xem trước template'
  }, [])

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

  const { elements, device = 'desktop' } = data
  const width = PAGE_WIDTH[device] || PAGE_WIDTH.desktop
  const topLevel = elements.filter((el) => !el.parentId)
  // Chiều cao trang = đáy của phần tử thấp nhất, chừa thêm chút lề.
  const height = Math.max(
    600,
    ...topLevel.map((el) => (el.y || 0) + (el.style?.height || 0) + 40),
  )

  // Phóng/thu để bề ngang trang khớp đúng bề ngang cửa sổ.
  const scale = viewportW / width

  return (
    // Khung ngoài giữ đúng chiều cao SAU khi phóng, nếu không sẽ dư/thiếu vùng cuộn.
    <div className="min-h-screen w-full overflow-x-hidden bg-white">
      <div style={{ height: height * scale }}>
        <div
          className="relative bg-white"
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
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
