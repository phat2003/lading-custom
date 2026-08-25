const PDF_MIME_TYPE = 'application/pdf'
const PDF_MAGIC = '%PDF-'

const headerValue = (headers, name) => {
  if (!headers) return ''
  if (typeof headers.get === 'function') return headers.get(name) || ''
  return headers[name] || headers[name.toLowerCase()] || ''
}

const decodeFilename = (value) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export const sanitizePdfFilename = (value, fallback = 'landing-page') => {
  const safeBase = String(value || fallback)
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/[. ]+$/g, '')
    .slice(0, 120)
  const filename = safeBase || fallback
  return filename.toLowerCase().endsWith('.pdf')
    ? filename
    : `${filename}.pdf`
}

export const resolvePdfFilename = (headers, landingPageName) => {
  const disposition = headerValue(headers, 'content-disposition')
  const encodedMatch = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)
  if (encodedMatch?.[1]) {
    return sanitizePdfFilename(decodeFilename(encodedMatch[1].trim()))
  }

  const quotedMatch = disposition.match(/filename\s*=\s*"([^"]+)"/i)
  if (quotedMatch?.[1]) return sanitizePdfFilename(quotedMatch[1])

  const plainMatch = disposition.match(/filename\s*=\s*([^;]+)/i)
  if (plainMatch?.[1]) return sanitizePdfFilename(plainMatch[1].trim())

  return sanitizePdfFilename(landingPageName)
}

export const mapPdfExportResponse = async (response, landingPageName) => {
  const blob = response?.data
  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error('Invalid PDF response')
  }

  const contentType = String(
    headerValue(response?.headers, 'content-type') || blob.type || '',
  ).toLowerCase()
  if (contentType && !contentType.includes(PDF_MIME_TYPE)) {
    throw new Error('Invalid PDF content type')
  }

  const signature = new TextDecoder().decode(
    await blob.slice(0, PDF_MAGIC.length).arrayBuffer(),
  )
  if (signature !== PDF_MAGIC) throw new Error('Invalid PDF signature')

  return {
    blob,
    filename: resolvePdfFilename(response?.headers, landingPageName),
  }
}

export const pdfExportErrorMessage = async (error, fallback) => {
  const data = error?.response?.data
  if (typeof data?.error === 'string' && data.error.trim()) {
    return data.error.trim()
  }

  if (data instanceof Blob && data.size > 0) {
    try {
      const text = (await data.text()).trim()
      if (text) {
        try {
          const parsed = JSON.parse(text)
          if (typeof parsed?.error === 'string' && parsed.error.trim()) {
            return parsed.error.trim()
          }
          if (typeof parsed?.message === 'string' && parsed.message.trim()) {
            return parsed.message.trim()
          }
        } catch {
          if (data.type?.includes('text/')) return text
        }
      }
    } catch {
      // Giữ thông báo an toàn nếu response lỗi không thể đọc được.
    }
  }

  return fallback
}

export const downloadPdfBlob = (blob, filename) => {
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)

  try {
    link.click()
  } finally {
    link.remove()
    // Đợi browser nhận download trước khi thu hồi URL; timer một lần tự được dọn sau khi chạy.
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
  }
}
