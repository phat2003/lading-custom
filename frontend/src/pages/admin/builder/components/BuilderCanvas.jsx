import { useState } from 'react'
import { PlusIcon, TrashIcon } from '../../../../components/icons'
import { devices } from '../mock'
import BlockRenderer from './BlockRenderer'

export default function BuilderCanvas({
  device,
  blocks = [],
  selectedId,
  onAddBlock,
  onSelect,
  onDelete,
}) {
  const [over, setOver] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setOver(false)
    const raw = e.dataTransfer.getData('application/json')
    if (!raw) return
    try {
      onAddBlock?.(JSON.parse(raw))
    } catch {
      /* payload không hợp lệ, bỏ qua */
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-100 p-8">
      <div className={`mx-auto ${devices[device] || devices.desktop}`}>
        <div
          onDragOver={(e) => {
            e.preventDefault()
            e.dataTransfer.dropEffect = 'copy'
            setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={handleDrop}
          className={`min-h-[70vh] rounded-lg border bg-white shadow-sm ${
            over ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200'
          }`}
        >
          {blocks.length === 0 ? (
            <div className="flex min-h-[60vh] items-center justify-center text-center">
              <div>
                <p className="text-gray-400">Kéo phần tử vào đây</p>
                <p className="mt-1 text-sm text-gray-300">
                  Chọn phần tử ở panel bên trái và thả vào trang để bắt đầu.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-1 p-4" onClick={() => onSelect?.(null)}>
              {blocks.map((block) => {
                const selected = block.id === selectedId
                return (
                  <div
                    key={block.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect?.(block.id)
                    }}
                    className={`relative rounded p-2 ${
                      selected ? 'ring-2 ring-blue-500' : 'hover:ring-1 hover:ring-blue-200'
                    }`}
                  >
                    <BlockRenderer block={block} />
                    {selected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete?.(block.id)
                        }}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow"
                        title="Xóa phần tử"
                      >
                        <TrashIcon size={14} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <button className="flex w-full items-center justify-center gap-2 rounded-b-lg border-t border-dashed border-gray-300 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50">
            <PlusIcon size={16} /> Thêm mới Section
          </button>
        </div>
      </div>
    </div>
  )
}
