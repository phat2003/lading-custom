import { useState } from 'react'
import * as Icons from '../../components/icons'

// Trang demo xem toàn bộ icon — chỉ dùng để dev, không nằm trong sản phẩm.
// Mở tại /icons (không cần đăng nhập).
export default function IconGallery() {
  const [query, setQuery] = useState('')
  const [size, setSize] = useState(24)
  const [copied, setCopied] = useState('')

  // Bỏ base wrapper 'Icon', chỉ giữ các icon thật.
  const entries = Object.entries(Icons)
    .filter(([name]) => name !== 'Icon')
    .filter(([name]) => name.toLowerCase().includes(query.toLowerCase()))

  const copyName = (name) => {
    navigator.clipboard?.writeText(name)
    setCopied(name)
    setTimeout(() => setCopied(''), 1200)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-1 text-2xl font-semibold">Icon Gallery</h1>
        <p className="mb-6 text-sm text-gray-600">
          {entries.length} icon · click vào icon để copy tên · đổi màu qua class{' '}
          <code className="rounded bg-gray-200 px-1">text-*</code>
        </p>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm icon theo tên..."
            className="w-64 rounded border px-3 py-2 focus:outline-none focus:ring"
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            Size: {size}px
            <input
              type="range"
              min="16"
              max="64"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </label>
          {copied && (
            <span className="text-sm text-green-600">Đã copy: {copied}</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {entries.map(([name, IconComp]) => (
            <button
              key={name}
              type="button"
              onClick={() => copyName(name)}
              className="flex flex-col items-center gap-2 rounded-lg border bg-white p-4 text-gray-700 transition-colors hover:border-blue-400 hover:text-blue-600"
              title={`Click để copy "${name}"`}
            >
              <IconComp size={size} />
              <span className="break-all text-center text-xs text-gray-500">
                {name}
              </span>
            </button>
          ))}
        </div>

        {entries.length === 0 && (
          <p className="text-gray-500">Không tìm thấy icon nào khớp.</p>
        )}
      </div>
    </div>
  )
}
