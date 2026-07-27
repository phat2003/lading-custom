import { useNavigate } from 'react-router-dom'
import { MonitorIcon, SmartphoneIcon, ZapIcon, UndoIcon, RedoIcon } from '../../../../components/icons'

const BuilderTopbar = ({ device, onDeviceChange, onUndo, onRedo, canUndo, canRedo, mode = 'template', onSave }) => {
  const navigate = useNavigate()
  const isSection = mode === 'section'

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-[#161618] px-3 text-gray-200">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(isSection ? '/admin/sections' : '/admin/templates')}
          className="flex items-center gap-2 text-sm font-semibold"
          title={isSection ? 'Về thư viện thành phần' : 'Về danh sách template'}
        >
          <span className="grid h-7 w-7 place-items-center rounded bg-blue-600 text-white">
            <ZapIcon size={16} />
          </span>
          {isSection ? 'Section Editor' : 'Template Editor'}
          <span className="rounded bg-yellow-400/20 px-1.5 py-0.5 text-[10px] font-bold text-yellow-400">PRO</span>
        </button>
        <span className="ml-2 hidden text-sm text-gray-400 md:inline">
          {isSection ? 'Section mẫu' : 'Dự án'}: <span className="text-gray-200">{isSection ? 'Thành phần mới' : 'Template mới'}</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 rounded-lg bg-white/5 p-1">
          <button
            onClick={() => onDeviceChange('desktop')}
            className={`rounded-md p-1.5 ${device === 'desktop' ? 'bg-white/15 text-white' : 'text-gray-400'}`}
          >
            <MonitorIcon size={18} />
          </button>
          <button
            onClick={() => onDeviceChange('mobile')}
            className={`rounded-md p-1.5 ${device === 'mobile' ? 'bg-white/15 text-white' : 'text-gray-400'}`}
          >
            <SmartphoneIcon size={18} />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onUndo} disabled={!canUndo} title="Hoàn tác (Ctrl+Z)" className="rounded-md p-2 text-gray-400 hover:bg-white/10 disabled:opacity-30">
            <UndoIcon size={18} />
          </button>
          <button onClick={onRedo} disabled={!canRedo} title="Làm lại (Ctrl+Shift+Z)" className="rounded-md p-2 text-gray-400 hover:bg-white/10 disabled:opacity-30">
            <RedoIcon size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        {isSection ? (
          <button
            onClick={onSave}
            className="rounded-md bg-yellow-400 px-4 py-1.5 font-semibold text-black hover:bg-yellow-300"
          >
            Lưu Section
          </button>
        ) : (
          <>
            <button className="rounded-md px-3 py-1.5 text-gray-300 hover:bg-white/10">Xem trước</button>
            <button className="rounded-md px-3 py-1.5 text-gray-300 hover:bg-white/10">Lưu bản nháp</button>
            <button className="rounded-md bg-yellow-400 px-3 py-1.5 font-semibold text-black hover:bg-yellow-300">
              Xuất bản
            </button>
          </>
        )}
      </div>
    </header>
  )
}

export default BuilderTopbar
