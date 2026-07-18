import {
  TypeIcon,
  TextIcon,
  TagIcon,
  MousePointerIcon,
  ImageIcon,
  VideoIcon,
  SparklesIcon,
  InputIcon,
  LayoutTemplateIcon,
  SquareIcon,
  MinusIcon,
  MoveVerticalIcon,
  EyeIcon,
  EyeOffIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  TrashIcon,
} from '../../../../components/icons'

const TYPE_ICON = {
  heading: TypeIcon,
  paragraph: TextIcon,
  label: TagIcon,
  button: MousePointerIcon,
  image: ImageIcon,
  video: VideoIcon,
  icon: SparklesIcon,
  input: InputIcon,
  textarea: InputIcon,
  section: LayoutTemplateIcon,
  box: SquareIcon,
  divider: MinusIcon,
  spacer: MoveVerticalIcon,
}

const TYPE_NAME = {
  heading: 'Tiêu đề',
  paragraph: 'Đoạn văn',
  label: 'Nhãn',
  button: 'Nút bấm',
  image: 'Ảnh',
  video: 'Video',
  icon: 'Icon',
  input: 'Ô nhập',
  textarea: 'Ô văn bản',
  section: 'Section',
  box: 'Hình hộp',
  divider: 'Đường kẻ',
  spacer: 'Khoảng trống',
}

const layerName = (el) => {
  const base = TYPE_NAME[el.type] || el.type
  return el.content ? `${base} · ${el.content.slice(0, 16)}` : base
}

const LayerRow = ({ el, depth, selectedId, onSelect, onToggleHidden, onDelete, onMoveLayer }) => {
  const IconComp = TYPE_ICON[el.type] || SquareIcon
  const active = el.id === selectedId

  return (
    <div
      onClick={() => onSelect(el.id)}
      style={{ paddingLeft: 8 + depth * 16 }}
      className={`group flex cursor-pointer items-center gap-2 py-1.5 pr-2 text-sm ${
        active ? 'bg-yellow-400/10 text-yellow-400' : 'text-gray-300 hover:bg-white/5'
      }`}
    >
      <IconComp size={14} className="shrink-0 opacity-70" />
      <span className={`flex-1 truncate ${el.hidden ? 'opacity-40' : ''}`}>{layerName(el)}</span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
        <button onClick={(e) => { e.stopPropagation(); onMoveLayer(el.id, 'forward') }} title="Đưa lên" className="rounded p-0.5 hover:bg-white/10">
          <ChevronUpIcon size={13} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onMoveLayer(el.id, 'backward') }} title="Đưa xuống" className="rounded p-0.5 hover:bg-white/10">
          <ChevronDownIcon size={13} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(el.id) }} title="Xóa" className="rounded p-0.5 text-red-400 hover:bg-white/10">
          <TrashIcon size={13} />
        </button>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleHidden(el.id) }}
        title={el.hidden ? 'Hiện' : 'Ẩn'}
        className="rounded p-0.5 text-gray-400 hover:bg-white/10"
      >
        {el.hidden ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
      </button>
    </div>
  )
}

const LayersPanel = ({ elements, selectedId, onSelect, onToggleHidden, onDelete, onMoveLayer }) => {
  // Hiển thị lớp trên cùng (z cao) ở đầu danh sách.
  const topLevel = [...elements.filter((e) => !e.parentId)].reverse()

  return (
    <aside className="w-60 shrink-0 overflow-y-auto border-r border-white/10 bg-[#1c1c1f]">
      <p className="border-b border-white/10 px-3 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">
        Lớp (Layers)
      </p>

      {topLevel.length === 0 ? (
        <p className="p-3 text-xs text-gray-500">Chưa có phần tử nào.</p>
      ) : (
        topLevel.map((el) => (
          <div key={el.id}>
            <LayerRow
              el={el}
              depth={0}
              selectedId={selectedId}
              onSelect={onSelect}
              onToggleHidden={onToggleHidden}
              onDelete={onDelete}
              onMoveLayer={onMoveLayer}
            />
            {el.type === 'section' &&
              [...elements.filter((c) => c.parentId === el.id)].reverse().map((child) => (
                <LayerRow
                  key={child.id}
                  el={child}
                  depth={1}
                  selectedId={selectedId}
                  onSelect={onSelect}
                  onToggleHidden={onToggleHidden}
                  onDelete={onDelete}
                  onMoveLayer={onMoveLayer}
                />
              ))}
          </div>
        ))
      )}
    </aside>
  )
}

export default LayersPanel
