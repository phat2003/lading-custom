export const USER_IMAGE_MAX_BYTES = 5 * 1024 * 1024

export const USER_IMAGE_ACCEPT =
  '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp'

export const USER_IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

export const getUserImageValidationError = (file) => {
  if (!file) return 'Vui lòng chọn một ảnh.'
  if (!USER_IMAGE_MIME_TYPES.has(file.type)) {
    return 'Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.'
  }
  if (!Number.isFinite(file.size) || file.size <= 0) {
    return 'Tệp ảnh không được để trống.'
  }
  if (file.size > USER_IMAGE_MAX_BYTES) {
    return 'Ảnh không được vượt quá 5MB.'
  }
  return ''
}
