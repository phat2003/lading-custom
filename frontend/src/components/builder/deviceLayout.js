// Bố cục theo từng thiết bị.
//
// Desktop là bản GỐC: x, y, style nằm thẳng trên phần tử.
// Mobile là lớp PHỦ riêng, cất trong el.mobile = { x, y, style }.
// Nhờ vậy sửa ở mobile không đụng gì tới desktop, và ngược lại.

// Trả về phần tử "đã hoà" theo thiết bị đang xem — dùng để render/đo đạc.
export const viewOf = (el, device) => {
  if (device !== 'mobile' || !el.mobile) return el
  return {
    ...el,
    x: el.mobile.x ?? el.x,
    y: el.mobile.y ?? el.y,
    style: { ...el.style, ...(el.mobile.style || {}) },
  }
}

export const viewAll = (elements, device) =>
  device === 'mobile' ? elements.map((el) => viewOf(el, device)) : elements

// Ghi thay đổi vào ĐÚNG lớp của thiết bị đang chỉnh.
export const writeLayer = (el, device, patch) => {
  if (device !== 'mobile') {
    return {
      ...el,
      ...patch,
      style: patch.style ? { ...el.style, ...patch.style } : el.style,
    }
  }
  const m = el.mobile || {}
  const next = { ...m }
  if ('x' in patch) next.x = patch.x
  if ('y' in patch) next.y = patch.y
  if ('content' in patch) return { ...el, content: patch.content, mobile: next } // nội dung dùng chung
  if (patch.style) next.style = { ...(m.style || {}), ...patch.style }
  return { ...el, mobile: next }
}

const scaled = (v, k) => (typeof v === 'number' ? Math.round(v * k) : v)

// Sinh bố cục mobile lần đầu bằng cách thu nhỏ đều bản desktop.
// Phần tử nào đã có lớp mobile thì giữ nguyên, không ghi đè công sức đã chỉnh.
export const buildMobileLayout = (elements, k) =>
  elements.map((el) =>
    el.mobile
      ? el
      : {
          ...el,
          mobile: {
            x: scaled(el.x, k),
            y: scaled(el.y, k),
            style: {
              width: scaled(el.style?.width, k),
              height: scaled(el.style?.height, k),
              fontSize: scaled(el.style?.fontSize, k),
              padding: scaled(el.style?.padding, k),
            },
          },
        },
  )

// Giữ phần tử nằm trong khuôn: top-level bị chặn theo khổ trang,
// phần tử con bị chặn trong lòng Section cha.
export const clampBox = ({ x, y, width, height }, bounds) => {
  const w = width || 0
  const h = height || 0
  const maxX = Math.max(0, bounds.width - w)
  const maxY = Math.max(0, bounds.height - h)
  return {
    x: Math.min(Math.max(0, x), maxX),
    y: Math.min(Math.max(0, y), maxY),
  }
}
