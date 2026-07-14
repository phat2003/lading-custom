import { useNavigate } from 'react-router-dom'
import {
  ZapIcon,
  PlusIcon,
  LayersIcon,
  MonitorIcon,
  TabletIcon,
  SmartphoneIcon,
  UndoIcon,
  RedoIcon,
  SparklesIcon,
  HelpCircleIcon,
  SettingsIcon,
} from '../../../../components/icons'

const DEVICE_BUTTONS = [
  { value: 'desktop', icon: MonitorIcon },
  { value: 'tablet', icon: TabletIcon },
  { value: 'mobile', icon: SmartphoneIcon },
]

export default function BuilderTopbar({ device, onDeviceChange }) {
  const navigate = useNavigate()
  const iconBtn = 'rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700'

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3">
      <div className="flex items-center gap-1">
        <button
          onClick={() => navigate('/admin/templates')}
          className="mr-1 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white"
          title="Về danh sách template"
        >
          <ZapIcon size={18} />
        </button>
        <button className={iconBtn}>
          <PlusIcon size={18} />
        </button>
        <button className={iconBtn}>
          <LayersIcon size={18} />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
          {DEVICE_BUTTONS.map(({ value, icon: IconComp }) => (
            <button
              key={value}
              onClick={() => onDeviceChange?.(value)}
              className={`rounded-md p-1.5 ${
                device === value ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'
              }`}
            >
              <IconComp size={18} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button className={iconBtn}>
            <UndoIcon size={18} />
          </button>
          <button className={iconBtn}>
            <RedoIcon size={18} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className={iconBtn}>
          <SparklesIcon size={18} />
        </button>
        <button className={iconBtn}>
          <HelpCircleIcon size={18} />
        </button>
        <button className={iconBtn}>
          <SettingsIcon size={18} />
        </button>
        <span className="mx-1 h-6 w-px bg-gray-200" />
        <button className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
          Lưu
        </button>
        <button className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
          Xem trước
        </button>
        <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500">
          Xem và xuất bản
        </button>
      </div>
    </header>
  )
}
