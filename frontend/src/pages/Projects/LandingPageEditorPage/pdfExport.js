import {
  binaryExportErrorMessage,
  downloadExportBlob,
  resolveExportFilename,
  sanitizeExportFilename,
  validateBinaryExportResponse,
} from './exportDownload.js'

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d]

export const sanitizePdfFilename = (value, fallback = 'landing-page') =>
  sanitizeExportFilename(value, 'pdf', fallback)

export const resolvePdfFilename = (headers, landingPageName) =>
  resolveExportFilename(headers, landingPageName, 'pdf')

export const mapPdfExportResponse = async (response, landingPageName) => {
  const blob = await validateBinaryExportResponse(response, {
    format: 'PDF',
    acceptedMimeTypes: ['application/pdf'],
    signatures: [PDF_SIGNATURE],
  })

  return {
    blob,
    filename: resolvePdfFilename(response?.headers, landingPageName),
  }
}

export const pdfExportErrorMessage = binaryExportErrorMessage

export const downloadPdfBlob = downloadExportBlob
