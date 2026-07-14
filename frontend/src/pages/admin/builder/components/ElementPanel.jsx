import { useState, useEffect } from 'react'
import { ChevronDownIcon } from '../../../../components/icons'
import { elements, textPresets } from '../mock'

const TEXT_TABS = ['Tiêu đề', 'Đoạn văn', 'Danh sách']

// Gắn payload vào drag để canvas đọc khi thả.
const dragProps = (payload) => ({
  draggable: true,
  onDragStart: (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify(payload))
    e.dataTransfer.effectAllowed = 'copy'
  },
})

function ElementList({ onPick }) {
  return (
    <div className="space-y-1 p-2">
      {elements.map((el) => (
        <button
          key={el.value}
          onClick={() => onPick(el)}
          {...dragProps({ type: el.value, content: el.label })}
          className="flex w-full cursor-grab items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 active:cursor-grabbing"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500">
            {el.label[0]}
          </span>
          {el.label}
        </button>
      ))}
    </div>
  )
}

function TextPresets({ onBack }) {
  const [tab, setTab] = useState(TEXT_TABS[0])
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 px-4 pt-3 text-xs text-gray-500 hover:text-gray-700"
      >
        <ChevronDownIcon size={14} className="rotate-90" /> Phần tử
      </button>
      <div className="flex gap-4 border-b border-gray-200 px-4 pt-2 text-sm">
        {TEXT_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 pb-2 ${
              t === tab ? 'border-blue-600 font-medium text-blue-600' : 'border-transparent text-gray-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="space-y-1 p-2">
        <p className="px-3 pb-1 pt-2 text-xs font-medium uppercase text-gray-400">Tiêu đề</p>
        {textPresets.map((p) => (
          <button
            key={p.label}
            {...dragProps({ type: 'text', preset: p.label, content: p.label, cls: p.cls })}
            className={`block w-full cursor-grab rounded-lg px-3 py-2 text-left text-gray-800 hover:bg-gray-100 active:cursor-grabbing ${p.cls}`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ElementPanel({ category }) {
  const [picked, setPicked] = useState(null)

  useEffect(() => {
    setPicked(null)
  }, [category])

  return (
    <aside className="w-64 shrink-0 overflow-y-auto border-r border-gray-200 bg-white">
      {category === 'elements' ? (
        picked?.value === 'text' ? (
          <TextPresets onBack={() => setPicked(null)} />
        ) : (
          <ElementList onPick={setPicked} />
        )
      ) : (
        <p className="p-4 text-sm text-gray-400">Bảng "{category}" đang được phát triển…</p>
      )}
    </aside>
  )
}
