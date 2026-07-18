import { useState } from 'react'
import { ChevronDownIcon } from '../../../../components/icons'
import { paletteGroups, paletteBlocks } from '../mock'

const groups = [...paletteGroups, paletteBlocks]

const dragProps = (payload) => ({
  draggable: true,
  onDragStart: (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify(payload))
    e.dataTransfer.effectAllowed = 'copy'
  },
})

const ElementPanel = () => {
  const [openGroup, setOpenGroup] = useState(groups[0].title)

  return (
    <aside className="w-60 shrink-0 overflow-y-auto border-r border-white/10 bg-[#1c1c1f]">
      <p className="border-b border-white/10 px-3 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">
        Thêm phần tử
      </p>

      {groups.map((group) => {
        const isOpen = openGroup === group.title
        return (
          <div key={group.title} className="border-b border-white/5">
            <button
              onClick={() => setOpenGroup(isOpen ? null : group.title)}
              className="flex w-full items-center justify-between px-3 py-2.5 text-sm font-medium text-gray-200 hover:bg-white/5"
            >
              <span className="flex items-center gap-2">
                <group.icon size={16} className="text-gray-400" />
                {group.title}
              </span>
              <ChevronDownIcon size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
              <div className="space-y-1.5 px-3 pb-3">
                {group.items.map((el) => {
                  const payload = el.block
                    ? { block: el.block }
                    : { type: el.type, content: el.content, style: el.style }
                  return (
                    <div
                      key={el.label}
                      {...dragProps(payload)}
                      className="flex cursor-grab items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 hover:border-yellow-400/50 hover:bg-white/10 active:cursor-grabbing"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded bg-white/10 text-gray-300">
                        <el.icon size={16} />
                      </span>
                      {el.label}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </aside>
  )
}

export default ElementPanel
