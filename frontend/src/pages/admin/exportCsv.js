// Xuất CSV phía client — không cần endpoint backend, dữ liệu đã có sẵn ở FE.
//
// columns: [{ label: 'Tên', value: (row) => row.name }]
// rows:    mảng bản ghi bất kỳ, value() tự rút field cần lấy.

// Bọc ô trong dấu nháy khi có ký tự dễ làm vỡ cấu trúc CSV.
// Nháy kép bên trong được nhân đôi theo chuẩn RFC 4180.
const toCell = (v) => {
  if (v === null || v === undefined) return ''
  const s = String(v)
  return /["\n\r,;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

// Tên file kèm ngày để tải nhiều lần không bị đè: users-2026-08-04.csv
export const csvFilename = (prefix) => `${prefix}-${new Date().toISOString().slice(0, 10)}.csv`

export const downloadCsv = (filename, columns, rows) => {
  const header = columns.map((c) => toCell(c.label)).join(',')
  const body = rows.map((r) => columns.map((c) => toCell(c.value(r))).join(',')).join('\r\n')

  // ﻿ (BOM) để Excel nhận đúng UTF-8, nếu không tiếng Việt sẽ thành ký tự lạ.
  const blob = new Blob([`﻿${header}\r\n${body}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
