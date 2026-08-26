import {
  CodeIcon,
  EyeIcon,
  GlobeIcon,
  HomeIcon,
  MoonIcon,
  RedoIcon,
  SaveIcon,
  SunIcon,
  UndoIcon,
} from '../../../../components/icons'
import { normalizePlan } from '../../../../utils/planEntitlements'
import ExportMenu from './ExportMenu'

const SAVE_STATUS = {
  saved: { label: 'Đã lưu', className: 'text-emerald-400' },
  dirty: { label: 'Chưa lưu', className: 'text-amber-400' },
  saving: { label: 'Đang lưu...', className: 'text-amber-400' },
  error: { label: 'Lưu thất bại', className: 'text-rose-400' },
}

const toolButton =
  'grid h-9 w-9 place-items-center rounded-xl text-[var(--bd-dim)] transition hover:bg-[var(--bd-fill-hover)] hover:text-[var(--bd-text)] disabled:cursor-not-allowed disabled:opacity-35'

const EditorTopbar = ({
  landingPageName,
  planType,
  saveStatus,
  onBack,
  onSave,
  onSaveAsTemplate,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onPreview,
  previewOpen = false,
  onStaticPreview,
  staticPreviewing = false,
  onExportPdf,
  onExportHtml,
  htmlExportAllowed = false,
  exportingFormat = null,
  onPublish,
  publishing = false,
  theme,
  onToggleTheme,
}) => {
  const status = SAVE_STATUS[saveStatus] || SAVE_STATUS.saved
  const planLabel = normalizePlan(planType).toUpperCase()
  const exporting = Boolean(exportingFormat)

  return (
    <header className="z-50 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[var(--bd-border)] bg-[var(--bd-topbar)] px-4 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-2 text-[var(--bd-text)] transition hover:bg-[var(--bd-fill-hover)]"
          title="Quay lại Project"
        >
          <HomeIcon size={18} />
          <span className="text-sm font-semibold">MyProject</span>
          <span className="rounded-md border border-[var(--bd-border)] bg-[var(--bd-fill)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--bd-accent)]">
            {planLabel}
          </span>
        </button>
        <div className="h-7 w-px bg-[var(--bd-border)]" />
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className={toolButton}
            title="Hoàn tác (Ctrl/Cmd + Z)"
          >
            <UndoIcon size={17} />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className={toolButton}
            title="Làm lại (Ctrl/Cmd + Shift + Z)"
          >
            <RedoIcon size={17} />
          </button>
        </div>
      </div>

      <div className="min-w-0 flex-1 text-center">
        <p className="truncate text-sm font-semibold text-[var(--bd-text)]">{landingPageName}</p>
        <p className={`font-mono text-[9px] uppercase tracking-wider ${status.className}`}>
          {status.label}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onToggleTheme}
          className={toolButton}
          title={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
        >
          {theme === 'dark' ? <SunIcon size={17} /> : <MoonIcon size={17} />}
        </button>
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={
              staticPreviewing ||
              exporting ||
              publishing ||
              saveStatus === 'saved' ||
              saveStatus === 'saving'
            }
            className="hidden items-center gap-2 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-45 md:flex"
          >
            <SaveIcon size={15} />
            {saveStatus === 'saving' ? 'Đang lưu...' : saveStatus === 'error' ? 'Thử lưu lại' : 'Lưu'}
          </button>
        )}
        {onSaveAsTemplate && (
          <button
            type="button"
            onClick={onSaveAsTemplate}
            disabled={
              staticPreviewing ||
              exporting ||
              publishing ||
              saveStatus === 'saving'
            }
            className="hidden rounded-xl border border-[var(--bd-border)] px-3.5 py-2 text-xs font-semibold text-[var(--bd-text)] transition hover:border-violet-400/50 hover:text-[var(--bd-accent)] disabled:opacity-45 xl:block"
          >
            Lưu thành mẫu
          </button>
        )}
        <button
          type="button"
          onClick={onPreview}
          aria-pressed={previewOpen}
          className={`hidden items-center gap-2 rounded-xl border px-3.5 py-2 text-xs transition md:flex ${
            previewOpen
              ? 'border-violet-400/60 bg-violet-500/10 text-[var(--bd-accent)]'
              : 'border-[var(--bd-border)] text-[var(--bd-text)] hover:border-violet-400/50 hover:text-[var(--bd-accent)]'
          }`}
        >
          <EyeIcon size={15} />
          {previewOpen ? 'Đóng Preview' : 'Preview'}
        </button>
        {onStaticPreview && (
          <button
            type="button"
            onClick={onStaticPreview}
            disabled={
              staticPreviewing ||
              exporting ||
              publishing ||
              saveStatus === 'saving'
            }
            className="hidden items-center gap-2 rounded-xl border border-[var(--bd-border)] px-2.5 py-2 text-xs text-[var(--bd-text)] transition hover:border-violet-400/50 hover:text-[var(--bd-accent)] disabled:cursor-wait disabled:opacity-45 md:flex xl:px-3.5"
            title="Tạo HTML tĩnh từ dữ liệu đã lưu trên server"
            aria-label={
              staticPreviewing
                ? 'Đang tạo bản xem trước tĩnh'
                : 'Bản xem trước tĩnh'
            }
          >
            <CodeIcon size={15} />
            <span className="xl:hidden">
              {staticPreviewing ? '...' : 'Tĩnh'}
            </span>
            <span className="hidden xl:inline">
              {staticPreviewing ? 'Đang tạo...' : 'Bản xem trước tĩnh'}
            </span>
          </button>
        )}
        {onExportPdf && (
          <ExportMenu
            onExportPdf={onExportPdf}
            onExportHtml={onExportHtml}
            htmlExportAllowed={htmlExportAllowed}
            exportingFormat={exportingFormat}
            disabled={
              staticPreviewing || publishing || saveStatus === 'saving'
            }
          />
        )}
        <button
          type="button"
          onClick={onPublish}
          disabled={
            !onPublish ||
            staticPreviewing ||
            exporting ||
            publishing ||
            saveStatus === 'saving'
          }
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-300 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_8px_24px_-12px_rgba(250,204,21,.8)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-55"
        >
          <GlobeIcon size={15} />
          {publishing ? 'Đang xuất bản...' : 'Xuất bản'}
        </button>
      </div>
    </header>
  )
}

export default EditorTopbar
