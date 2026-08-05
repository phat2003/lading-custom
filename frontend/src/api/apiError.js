const STATUS_MESSAGES = {
  400: 'Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra và thử lại.',
  401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy dữ liệu được yêu cầu.',
  409: 'Dữ liệu đã thay đổi trên máy chủ. Vui lòng tải lại trước khi thử lại.',
  422: 'Máy chủ không thể xử lý dữ liệu đã gửi.',
}

const isAbortError = (error) =>
  error?.code === 'ERR_CANCELED' ||
  error?.name === 'AbortError' ||
  error?.name === 'CanceledError'

const isTimeoutError = (error) =>
  error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT'

const createNormalizedError = ({
  status = null,
  kind,
  userMessage,
  retryable = false,
  outcomeUnknown = false,
}) => ({
  status,
  kind,
  userMessage,
  retryable,
  outcomeUnknown,
  normalized: true,
})

export const createApiContractError = (userMessage) =>
  createNormalizedError({
    kind: 'contract',
    userMessage,
  })

/**
 * Chuyển lỗi Axios/HTTP thành lỗi an toàn cho UI. Không giữ raw response,
 * request config, stack trace hoặc token trong object trả về.
 */
export const normalizeApiError = (
  error,
  { outcomeUnknownOnNetwork = false } = {},
) => {
  if (error?.normalized === true) return error

  if (isAbortError(error)) {
    return createNormalizedError({
      kind: 'aborted',
      userMessage: 'Yêu cầu đã được hủy.',
    })
  }

  if (isTimeoutError(error)) {
    return createNormalizedError({
      kind: 'timeout',
      userMessage: outcomeUnknownOnNetwork
        ? 'Không nhận được xác nhận từ máy chủ. Trạng thái thao tác cần được kiểm tra lại trước khi thử lại.'
        : 'Máy chủ phản hồi quá lâu. Vui lòng thử lại.',
      retryable: !outcomeUnknownOnNetwork,
      outcomeUnknown: outcomeUnknownOnNetwork,
    })
  }

  const status = Number.isInteger(error?.response?.status)
    ? error.response.status
    : null

  if (status === null) {
    return createNormalizedError({
      kind: 'network',
      userMessage: outcomeUnknownOnNetwork
        ? 'Mất kết nối trước khi nhận được xác nhận. Hãy kiểm tra trạng thái trên máy chủ trước khi thử lại.'
        : 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối và thử lại.',
      retryable: !outcomeUnknownOnNetwork,
      outcomeUnknown: outcomeUnknownOnNetwork,
    })
  }

  if (status >= 500) {
    return createNormalizedError({
      status,
      kind: 'server',
      userMessage: 'Máy chủ đang gặp sự cố. Nội dung hiện tại của bạn vẫn được giữ nguyên.',
      retryable: true,
    })
  }

  return createNormalizedError({
    status,
    kind: 'http',
    userMessage:
      STATUS_MESSAGES[status] ||
      'Không thể hoàn tất yêu cầu. Vui lòng kiểm tra và thử lại.',
    retryable: status === 408 || status === 429,
  })
}
