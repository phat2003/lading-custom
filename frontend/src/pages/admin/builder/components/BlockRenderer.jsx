import { ImageIcon } from '../../../../components/icons'

export default function BlockRenderer({ block }) {
  switch (block.type) {
    case 'text':
      return <div className={block.cls || 'text-base'}>{block.content}</div>
    case 'button':
      return (
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white">
          {block.content || 'Nút bấm'}
        </button>
      )
    case 'divider':
      return <hr className="border-gray-300" />
    case 'image':
    case 'gallery':
      return (
        <div className="flex h-32 items-center justify-center rounded bg-gray-100 text-gray-400">
          <ImageIcon size={24} />
        </div>
      )
    default:
      return (
        <div className="rounded border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-400">
          {block.content || block.type}
        </div>
      )
  }
}
