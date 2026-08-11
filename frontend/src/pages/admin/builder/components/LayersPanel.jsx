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

const miniBtn =
  'rounded-md p-1 text-[var(--bd-dim)] transition-colors hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]'

const LayerRow = ({ el, depth, index, selectedId, onSelect, onToggleHidden, onDelete, onMoveLayer }) => {
  const IconComp = TYPE_ICON[el.type] || SquareIcon
  const active = el.id === selectedId

  return (
    <div
      onClick={() => onSelect(el.id)}
      style={{ paddingLeft: 8 + depth * 14, animationDelay: `${index * 25}ms` }}
      className={`group mb-0.5 flex animate-fade-in-up cursor-pointer items-center gap-2 rounded-lg py-2 pr-2 text-[13px] transition-all duration-200 ${
        active
          ? 'bg-gradient-to-r from-violet-500/20 to-cyan-400/10 text-[var(--bd-accent)] ring-1 ring-inset ring-violet-400/25'
          : 'text-[var(--bd-dim)] hover:translate-x-0.5 hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)]'
      }`}
    >
      <IconComp size={14} className={`shrink-0 ${active ? '' : 'opacity-60'}`} />
      <span className={`flex-1 truncate ${el.hidden ? 'opacity-40' : ''}`}>{layerName(el)}</span>

      <div className="flex items-center gap-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <button onClick={(e) => { e.stopPropagation(); onMoveLayer(el.id, 'forward') }} title="Đưa lên" className={miniBtn}>
          <ChevronUpIcon size={13} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onMoveLayer(el.id, 'backward') }} title="Đưa xuống" className={miniBtn}>
          <ChevronDownIcon size={13} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(el.id) }} title="Xóa" className="rounded-md p-1 text-red-400 transition-colors hover:bg-red-500/15 hover:text-red-300">
          <TrashIcon size={13} />
        </button>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onToggleHidden(el.id) }}
        title={el.hidden ? 'Hiện' : 'Ẩn'}
        className={miniBtn}
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
    <aside className="w-64 shrink-0 animate-slide-in-left overflow-y-auto border-r border-[var(--bd-border)] bg-[var(--bd-panel)] backdrop-blur-xl">
      <p className="sticky top-0 z-10 flex items-center gap-2 border-b border-[var(--bd-border)] bg-[var(--bd-panel-solid)] px-4 py-3.5 text-[11px] font-semibold uppercase tracking-widest text-[var(--bd-dim)] backdrop-blur-xl">
        <span className="h-3 w-0.5 rounded-full bg-gradient-to-b from-violet-400 to-cyan-400" />
        Lớp (Layers)
      </p>

      <div className="p-2">
        {topLevel.length === 0 ? (
          <p className="px-2 py-3 text-xs text-[var(--bd-muted)]">Chưa có phần tử nào.</p>
        ) : (
          topLevel.map((el, i) => (
            <div key={el.id}>
              <LayerRow
                el={el}
                depth={0}
                index={i}
                selectedId={selectedId}
                onSelect={onSelect}
                onToggleHidden={onToggleHidden}
                onDelete={onDelete}
                onMoveLayer={onMoveLayer}
              />
              {el.type === 'section' &&
                [...elements.filter((c) => c.parentId === el.id)].reverse().map((child, ci) => (
                  <LayerRow
                    key={child.id}
                    el={child}
                    depth={1}
                    index={i + ci + 1}
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
      </div>
    </aside>
  )
}

export default LayersPanel
