import {
  CopyIcon,
  MonitorIcon,
  PencilIcon,
  PlusIcon,
  SmartphoneIcon,
  TabletIcon,
  TrashIcon,
} from '../../../../components/icons'
import LandingPageSectionContent from '../../components/LandingPageSectionContent'
import { DEVICE_PRESETS, getDevicePreset } from '../preview/devicePresets'
import PreviewFrame, { ReadOnlyPreview } from './PreviewFrame'

const DEVICE_ICONS = {
  desktop: MonitorIcon,
  tablet: TabletIcon,
  mobile: SmartphoneIcon,
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

      <LandingPageSectionContent section={section} />
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
  const activePreset = getDevicePreset(viewport)

  return (
    <main className="editor-canvas-grid relative flex min-w-0 flex-1 flex-col overflow-hidden px-8 pb-8 pt-20">
      <div className="absolute left-1/2 top-4 z-30 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/10 bg-[#252a3a]/95 px-4 py-2 shadow-2xl backdrop-blur">
        <div className="flex items-center gap-1">
          {DEVICE_PRESETS.map((preset) => {
            const ViewportIcon = DEVICE_ICONS[preset.id]
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onViewportChange(preset.id)}
                className={`rounded-full p-2 transition ${
                  viewport === preset.id
                    ? 'bg-[#2563eb] text-white'
                    : 'text-[#c3c6d7] hover:text-white'
                }`}
                aria-label={`Xem ở chế độ ${preset.label}`}
                aria-pressed={viewport === preset.id}
                title={`${preset.label} — ${preset.width} × ${preset.height}`}
              >
                <ViewportIcon size={18} />
              </button>
            )
          })}
        </div>
        <div className="h-5 w-px bg-white/15" />
        <span className="whitespace-nowrap font-mono text-[10px] text-[#c3c6d7]">
          {activePreset.width} × {activePreset.height}
        </span>
        {!activePreset.editable && (
          <span className="whitespace-nowrap rounded-full border border-[#eec200]/30 bg-[#eec200]/10 px-2 py-1 font-mono text-[9px] uppercase text-[#ffe083]">
            Chỉ đọc
          </span>
        )}
        <div className="h-5 w-px bg-white/15" />
        <button
          type="button"
          onClick={() => onZoomChange(Math.max(50, zoom - 10))}
          className="px-1 text-[#c3c6d7]"
          aria-label="Thu nhỏ preview"
          title="Giảm zoom 10%"
        >
          −
        </button>
        <button
          type="button"
          onClick={() => onZoomChange(100)}
          className="w-12 text-center font-mono text-xs text-white"
          aria-label="Đặt lại zoom về mức fit mặc định 100%"
          title="Đặt lại về Fit 100%"
        >
          {zoom}%
        </button>
        <button
          type="button"
          onClick={() => onZoomChange(Math.min(200, zoom + 10))}
          className="px-1 text-[#c3c6d7]"
          aria-label="Phóng to preview"
          title="Tăng zoom 10%"
        >
          +
        </button>
      </div>

      <PreviewFrame preset={activePreset} zoom={zoom}>
        {activePreset.editable ? (
          <div className="h-full space-y-8 overflow-y-auto bg-white p-12 text-[#0e0e10] sm:p-16">
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
              <span className="mt-2 text-sm">
                Nhấn để thêm một Section vào Landing Page
              </span>
            </button>
          </div>
        ) : (
          <ReadOnlyPreview
            key={activePreset.id}
            preset={activePreset}
            sections={sections}
          />
        )}
      </PreviewFrame>
    </main>
  )
}
