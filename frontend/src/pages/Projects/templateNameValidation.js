export const TEMPLATE_NAME_MIN_LENGTH = 2
export const TEMPLATE_NAME_MAX_LENGTH = 200

export const getTemplateNameValidationError = (name) => {
  const normalizedName = typeof name === 'string' ? name.trim() : ''

  if (normalizedName.length < TEMPLATE_NAME_MIN_LENGTH) {
    return 'Tên Template phải có ít nhất 2 ký tự.'
  }
  if (normalizedName.length > TEMPLATE_NAME_MAX_LENGTH) {
    return 'Tên Template không được vượt quá 200 ký tự.'
  }

  return ''
}
