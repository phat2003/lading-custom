import {
  CopyIcon,
  ImageIcon,
  LayoutTemplateIcon,
  MonitorIcon,
  PencilIcon,
  PlusIcon,
  SmartphoneIcon,
  TabletIcon,
  TrashIcon,
} from '../../../../components/icons'

const VIEWPORTS = {
  desktop: { width: '100%', icon: MonitorIcon, label: 'Desktop' },
  tablet: { width: '760px', icon: TabletIcon, label: 'Tablet' },
  mobile: { width: '390px', icon: SmartphoneIcon, label: 'Mobile' },
}

function SectionContent({ section }) {
  if (section.type === 'image') {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border-2 border-dashed border-current/20">
        <ImageIcon size={44} className="opacity-35" />
        <h2 className="mt-4 text-xl font-semibold">{section.title}</h2>
        <p className="mt-2 opacity-60">{section.text}</p>
      </div>
    )
  }

  if (section.type === 'columns') {
    const [leftText, rightText] = section.text.split('|')
    return (
      <div>
        <h2 className="text-3xl font-bold">{section.title}</h2>
        <div className="mt-8 grid grid-cols-2 gap-6">
          {[leftText, rightText].map((text, index) => (
            <div key={`${text}-${index}`} className="rounded-lg border border-current/10 bg-white/30 p-7">
              <p className="text-lg font-semibold">Cột {index + 1}</p>
              <p className="mt-3 opacity-70">{text || `Nội dung cột ${index + 1}`}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (section.type === 'heading') {
    return <h2 className="text-4xl font-bold">{section.title}</h2>
  }

  if (section.type === 'text') {
    return <p className="text-lg leading-8 opacity-75">{section.text}</p>
  }

  if (section.type === 'hero') {
    return (
      <div>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#2563eb]/10 text-[#2563eb]">
          <LayoutTemplateIcon size={30} />
        </div>
        <h1 className="mt-7 text-4xl font-bold">{section.title}</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 opacity-70">{section.text}</p>
        {section.buttonText && (
          <button
            type="button"
            className="mt-8 rounded-lg bg-[#2563eb] px-8 py-3 font-bold text-white shadow-[0_8px_25px_rgba(37,99,235,0.25)]"
          >
            {section.buttonText}
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      {section.title && <h2 className="text-3xl font-bold">{section.title}</h2>}
      {section.text && <p className="mt-4 text-lg leading-8 opacity-70">{section.text}</p>}
      {section.buttonText && (
        <button
          type="button"
          className="mt-7 rounded-lg bg-[#2563eb] px-7 py-3 font-bold text-white"
        >
          {section.buttonText}
        </button>
      )}
    </div>
  )
}

function CanvasSection({
  section,
  index,
  total,
  selected,
  onSelect,
  onMove,
  onDuplicate,
  onDelete,
}) {
  return (
    <section
      onClick={() => onSelect(section.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') onSelect(section.id)
      }}
      role="button"
      tabIndex={0}
      className={`group relative rounded border border-dashed px-8 py-12 outline-none transition ${
        selected
          ? 'border-[#2563eb] ring-2 ring-[#2563eb]/15'
          : 'border-transparent hover:border-[#b4c5ff]'
      }`}
      style={{
        backgroundColor: section.backgroundColor,
        color: section.textColor,
        textAlign: section.align,
      }}
    >
      <span
        className={`absolute -top-3 left-4 rounded bg-[#b4c5ff] px-2 py-1 font-mono text-[9px] uppercase text-[#002a78] shadow ${
          selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        {section.type}
      </span>

      <div
        className={`absolute right-2 top-0 z-10 flex -translate-y-1/2 overflow-hidden rounded bg-[#2563eb] text-white shadow-lg ${
          selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onSelect(section.id)
          }}
          className="p-2 hover:bg-white/15"
          title="Chỉnh sửa"
        >
          <PencilIcon size={14} />
        </button>
        <button
          type="button"
          disabled={index === 0}
          onClick={(event) => {
            event.stopPropagation()
            onMove(section.id, -1)
          }}
          className="px-2 disabled:opacity-35"
          title="Di chuyển lên"
        >
          ↑
        </button>
        <button
          type="button"
          disabled={index === total - 1}
          onClick={(event) => {
            event.stopPropagation()
            onMove(section.id, 1)
          }}
          className="px-2 disabled:opacity-35"
          title="Di chuyển xuống"
        >
          ↓
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onDuplicate(section.id)
          }}
          className="p-2 hover:bg-white/15"
          title="Nhân bản"
        >
          <CopyIcon size={14} />
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onDelete(section.id)
          }}
          className="p-2 hover:bg-red-500/60"
          title="Xóa"
        >
          <TrashIcon size={14} />
        </button>
      </div>

      <SectionContent section={section} />
    </section>
  )
}

export default function EditorCanvas({
  sections,
  selectedSectionId,
  viewport,
  zoom,
  onViewportChange,
  onZoomChange,
  onSelectSection,
  onAddSection,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
}) {
  const canvasStyle = {
    width: VIEWPORTS[viewport].width,
    transform: `scale(${zoom / 100})`,
    transformOrigin: 'top center',
  }

  return (
    <main className="editor-canvas-grid relative min-w-0 flex-1 overflow-auto px-8 pb-28 pt-28">
      <div className="fixed left-1/2 top-20 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-[#252a3a]/95 px-4 py-2 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-1">
          {Object.entries(VIEWPORTS).map(([key, option]) => {
            const ViewportIcon = option.icon
            return (
              <button
                key={key}
                type="button"
                onClick={() => onViewportChange(key)}
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
          onClick={() => onZoomChange(Math.max(60, zoom - 10))}
          className="px-1 text-[#c3c6d7]"
        >
          −
        </button>
        <span className="w-12 text-center font-mono text-xs text-white">{zoom}%</span>
        <button
          type="button"
          onClick={() => onZoomChange(Math.min(120, zoom + 10))}
          className="px-1 text-[#c3c6d7]"
        >
          +
        </button>
      </div>

      <div
        className="mx-auto min-h-[850px] max-w-[1000px] transition-all duration-300"
        style={canvasStyle}
      >
        <div className="min-h-[800px] space-y-8 bg-white p-12 text-[#0e0e10] shadow-2xl sm:p-16">
          {sections.map((section, index) => (
            <CanvasSection
              key={section.id}
              section={section}
              index={index}
              total={sections.length}
              selected={selectedSectionId === section.id}
              onSelect={onSelectSection}
              onMove={onMoveSection}
              onDuplicate={onDuplicateSection}
              onDelete={onDeleteSection}
            />
          ))}

          <button
            type="button"
            onClick={() => onAddSection('section')}
            className="flex min-h-[260px] w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#c7cad2] text-[#b5b9c3] transition hover:border-[#b4c5ff] hover:text-[#8d90a0]"
          >
            <PlusIcon size={52} />
            <span className="mt-5 text-2xl font-bold">
              {sections.length === 0 ? 'Bắt đầu thiết kế' : 'Thêm Section mới'}
            </span>
            <span className="mt-2 text-sm">Nhấn để thêm một Section vào Landing Page</span>
          </button>
        </div>
      </div>
    </main>
  )
}
