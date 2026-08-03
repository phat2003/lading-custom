import { useEffect, useState } from 'react'
import { SparklesIcon, ImageIcon, VideoIcon, StarIcon } from '../../../../components/icons'
import { ICON_MAP } from '../iconMap'

const youtubeEmbed = (url) => {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

const Countdown = ({ target, style }) => {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const end = target ? new Date(target).getTime() : now + 7 * 86400000
  const diff = Math.max(0, end - now)
  const parts = [
    [Math.floor(diff / 86400000), 'Ngày'],
    [Math.floor((diff % 86400000) / 3600000), 'Giờ'],
    [Math.floor((diff % 3600000) / 60000), 'Phút'],
    [Math.floor((diff % 60000) / 1000), 'Giây'],
  ]
  return (
    <div className="flex h-full w-full items-center justify-center gap-4">
      {parts.map(([v, label]) => (
        <div key={label} className="flex flex-col items-center">
          <span style={{ fontSize: style.fontSize, fontWeight: style.fontWeight, color: style.color, fontFamily: style.fontFamily }}>
            {String(v).padStart(2, '0')}
          </span>
          <span style={{ fontSize: 11, color: style.color }}>{label}</span>
        </div>
      ))}
    </div>
  )
}

const BlockRenderer = ({ element }) => {
  const { type, content, style } = element

  const textStyle = {
    fontSize: style.fontSize,
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    fontStyle: style.fontStyle,
    textDecoration: style.textDecoration,
    textAlign: style.textAlign,
    color: style.color,
  }

  switch (type) {
    case 'button':
      return (
        <button type="button" style={{ ...textStyle, backgroundColor: style.bgColor, borderRadius: style.borderRadius }} className="h-full w-full px-4 py-2">
          {content || 'Nút bấm'}
        </button>
      )

    case 'image':
      return content ? (
        <img src={content} alt="" className="h-full w-full object-cover" style={{ borderRadius: style.borderRadius }} />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400" style={{ borderRadius: style.borderRadius }}>
          <ImageIcon size={32} />
        </div>
      )

    case 'gallery': {
      const n = Number(content) || 3
      return (
        <div className="grid h-full w-full grid-cols-3 gap-1.5" style={{ borderRadius: style.borderRadius }}>
          {Array.from({ length: n }).map((_, i) => (
            <div key={i} className="flex items-center justify-center rounded bg-gray-200 text-gray-400">
              <ImageIcon size={18} />
            </div>
          ))}
        </div>
      )
    }

    case 'video': {
      if (!content) {
        return (
          <div className="flex h-full w-full items-center justify-center bg-gray-900 text-gray-500" style={{ borderRadius: style.borderRadius }}>
            <VideoIcon size={36} />
          </div>
        )
      }
      const embed = youtubeEmbed(content)
      return embed ? (
        <iframe src={embed} title="video" className="pointer-events-none h-full w-full" style={{ borderRadius: style.borderRadius }} allowFullScreen />
      ) : (
        <video src={content} controls className="pointer-events-none h-full w-full" style={{ borderRadius: style.borderRadius }} />
      )
    }

    case 'input':
      return (
        <input readOnly placeholder={content} style={{ fontSize: style.fontSize, fontFamily: style.fontFamily, color: style.color, backgroundColor: style.bgColor, borderRadius: style.borderRadius }} className="pointer-events-none h-full w-full border border-gray-300 px-3" />
      )

    case 'textarea':
      return (
        <textarea readOnly placeholder={content} style={{ fontSize: style.fontSize, fontFamily: style.fontFamily, color: style.color, backgroundColor: style.bgColor, borderRadius: style.borderRadius }} className="pointer-events-none h-full w-full resize-none border border-gray-300 px-3 py-2" />
      )

    case 'checkbox':
      return (
        <label style={textStyle} className="flex h-full w-full items-center gap-2">
          <input type="checkbox" readOnly className="pointer-events-none h-4 w-4" />
          {content}
        </label>
      )

    case 'select': {
      const opts = (content || '').split('\n').filter(Boolean)
      return (
        <select disabled style={{ fontSize: style.fontSize, fontFamily: style.fontFamily, color: style.color, backgroundColor: style.bgColor, borderRadius: style.borderRadius }} className="pointer-events-none h-full w-full border border-gray-300 px-2">
          {opts.map((o, i) => (
            <option key={i}>{o}</option>
          ))}
        </select>
      )
    }

    case 'list': {
      const items = (content || '').split('\n').filter(Boolean)
      return (
        <ul style={textStyle} className="h-full w-full list-disc space-y-1 pl-5">
          {items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )
    }

    case 'quote':
      return (
        <blockquote style={textStyle} className="h-full w-full border-l-4 border-gray-300 pl-4">
          {content}
        </blockquote>
      )

    case 'table': {
      const rows = (content || '').split('\n').map((r) => r.split('|'))
      return (
        <table style={{ fontSize: style.fontSize, fontFamily: style.fontFamily, color: style.color }} className="h-full w-full border-collapse text-left">
          <tbody>
            {rows.map((cells, ri) => (
              <tr key={ri}>
                {cells.map((c, ci) =>
                  ri === 0 ? (
                    <th key={ci} className="border border-gray-300 bg-gray-50 px-2 py-1 font-semibold">{c}</th>
                  ) : (
                    <td key={ci} className="border border-gray-300 px-2 py-1">{c}</td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )
    }

    case 'menu': {
      const items = (content || '').split('\n').filter(Boolean)
      return (
        <nav className="flex h-full w-full items-center justify-center gap-6" style={{ fontSize: style.fontSize, fontFamily: style.fontFamily, color: style.color }}>
          {items.map((it, i) => (
            <span key={i} className="whitespace-nowrap">{it}</span>
          ))}
        </nav>
      )
    }

    case 'rating': {
      const v = Number(content) || 0
      return (
        <div className="flex h-full w-full items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} size={style.fontSize || 24} style={{ color: i < v ? style.color || '#f59e0b' : '#d1d5db' }} />
          ))}
        </div>
      )
    }

    case 'progress': {
      const p = Math.max(0, Math.min(100, Number(content) || 0))
      return (
        <div className="flex h-full w-full items-center">
          <div className="h-full w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full" style={{ width: `${p}%`, backgroundColor: style.color || '#2563eb' }} />
          </div>
        </div>
      )
    }

    case 'embed':
      return <div className="h-full w-full overflow-auto" dangerouslySetInnerHTML={{ __html: content || '' }} />

    case 'card': {
      const [title, desc] = (content || '').split('|')
      return (
        <div className="flex h-full w-full flex-col justify-center p-4" style={{ backgroundColor: style.bgColor, borderRadius: style.borderRadius }}>
          <div style={{ fontSize: style.fontSize, fontFamily: style.fontFamily, fontWeight: 700, color: style.color, textAlign: style.textAlign }}>{title}</div>
          {desc && <div className="mt-1" style={{ fontSize: (style.fontSize || 16) - 2, fontFamily: style.fontFamily, color: '#6b7280', textAlign: style.textAlign }}>{desc}</div>}
        </div>
      )
    }

    case 'iconbox': {
      const [title, desc] = (content || '').split('|')
      return (
        <div className="flex h-full w-full flex-col items-center gap-2 text-center">
          <SparklesIcon size={(style.fontSize || 16) * 2} style={{ color: style.color }} />
          <div style={{ fontSize: style.fontSize, fontFamily: style.fontFamily, fontWeight: 600, color: style.color }}>{title}</div>
          {desc && <div style={{ fontSize: (style.fontSize || 16) - 2, fontFamily: style.fontFamily, color: '#6b7280' }}>{desc}</div>}
        </div>
      )
    }

    case 'countdown':
      return <Countdown target={content} style={style} />

    case 'icon': {
      const IconComp = ICON_MAP[content] || SparklesIcon
      return (
        <span style={{ color: style.color }}>
          <IconComp size={style.fontSize} />
        </span>
      )
    }

    case 'section': {
      const cols = style.columns || 1
      return (
        <div className="h-full w-full" style={{ backgroundColor: style.bgColor, borderRadius: style.borderRadius }}>
          {cols > 1 &&
            Array.from({ length: cols - 1 }).map((_, i) => (
              <div key={i} className="absolute bottom-0 top-0 border-l border-dashed border-gray-400/50" style={{ left: `${((i + 1) / cols) * 100}%` }} />
            ))}
        </div>
      )
    }

    case 'box':
      return <div className="h-full w-full" style={{ backgroundColor: style.bgColor, borderRadius: style.borderRadius }} />

    case 'divider':
      return (
        <div className="flex h-full w-full items-center">
          <div
            className="w-full"
            style={{ borderTopWidth: style.lineWidth || 2, borderTopStyle: style.borderStyle || 'solid', borderTopColor: style.color || '#d1d5db' }}
          />
        </div>
      )

    case 'spacer':
      return <div className="h-full w-full rounded border border-dashed border-gray-300 bg-gray-50/40" />

    default:
      // heading | label | paragraph
      return (
        <div style={textStyle} className="h-full w-full whitespace-pre-wrap">
          {content}
        </div>
      )
  }
}

export default BlockRenderer
