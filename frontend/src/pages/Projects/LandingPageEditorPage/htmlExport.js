import {
  binaryExportErrorMessage,
  downloadExportBlob,
  resolveExportFilename,
  validateBinaryExportResponse,
} from './exportDownload.js'

const ZIP_SIGNATURES = [
  [0x50, 0x4b, 0x03, 0x04],
  [0x50, 0x4b, 0x05, 0x06],
  [0x50, 0x4b, 0x07, 0x08],
]

export const HTML_EXPORT_PRO_REASON =
  'Xuất HTML/CSS/JS chỉ khả dụng với gói Pro.'

export const mapHtmlExportResponse = async (response, landingPageName) => {
  const blob = await validateBinaryExportResponse(response, {
    format: 'ZIP',
    acceptedMimeTypes: [
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream',
    ],
    signatures: ZIP_SIGNATURES,
  })

  return {
    blob,
    filename: resolveExportFilename(
      response?.headers,
      landingPageName,
      'zip',
      'landing-page-export',
    ),
  }
}

export const isHtmlExportEntitlementError = (error, message = '') => {
  if (error?.response?.status !== 403) return false
  const normalized = String(message).trim().toLowerCase()
  return (
    normalized.includes('gói pro') ||
    normalized.includes('plan pro') ||
    normalized.includes('không xác định được gói dịch vụ')
  )
}

export const htmlExportErrorMessage = binaryExportErrorMessage
export const downloadHtmlExportBlob = downloadExportBlob
