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

export const sanitizeExportFilename = (
  value,
  extension,
  fallback = 'landing-page',
) => {
  const normalizedExtension = String(extension).replace(/^\.+/, '').toLowerCase()
  const safeBase = String(value || fallback)
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/[. ]+$/g, '')
    .slice(0, 120)
  const filename = safeBase || fallback
  return filename.toLowerCase().endsWith(`.${normalizedExtension}`)
    ? filename
    : `${filename}.${normalizedExtension}`
}

export const resolveExportFilename = (
  headers,
  landingPageName,
  extension,
  fallback = 'landing-page',
) => {
  const disposition = headerValue(headers, 'content-disposition')
  const encodedMatch = disposition.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)
  if (encodedMatch?.[1]) {
    return sanitizeExportFilename(
      decodeFilename(encodedMatch[1].trim()),
      extension,
      fallback,
    )
  }

  const quotedMatch = disposition.match(/filename\s*=\s*"([^"]+)"/i)
  if (quotedMatch?.[1]) {
    return sanitizeExportFilename(quotedMatch[1], extension, fallback)
  }

  const plainMatch = disposition.match(/filename\s*=\s*([^;]+)/i)
  if (plainMatch?.[1]) {
    return sanitizeExportFilename(plainMatch[1].trim(), extension, fallback)
  }

  return sanitizeExportFilename(landingPageName, extension, fallback)
}

export const validateBinaryExportResponse = async (
  response,
  { format, acceptedMimeTypes, signatures },
) => {
  const blob = response?.data
  if (!(blob instanceof Blob) || blob.size === 0) {
    throw new Error(`Invalid ${format} response`)
  }

  const contentType = String(
    headerValue(response?.headers, 'content-type') || blob.type || '',
  ).toLowerCase()
  if (
    contentType &&
    !acceptedMimeTypes.some((mimeType) => contentType.includes(mimeType))
  ) {
    throw new Error(`Invalid ${format} content type`)
  }

  const signatureLength = Math.max(...signatures.map((signature) => signature.length))
  const prefix = new Uint8Array(
    await blob.slice(0, signatureLength).arrayBuffer(),
  )
  const hasValidSignature = signatures.some(
    (signature) =>
      signature.length <= prefix.length &&
      signature.every((byte, index) => prefix[index] === byte),
  )
  if (!hasValidSignature) throw new Error(`Invalid ${format} signature`)

  return blob
}

export const binaryExportErrorMessage = async (error, fallback) => {
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

export const downloadExportBlob = (blob, filename) => {
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
