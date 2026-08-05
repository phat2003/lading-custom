import { useCallback, useEffect, useRef, useState } from 'react'

const BUSY_STATES = new Set(['publishing', 'unpublishing'])
const GENERIC_PUBLISH_ERROR =
  'Không thể xuất bản Landing Page lúc này. Nội dung trong Editor vẫn được giữ nguyên.'
const GENERIC_UNPUBLISH_ERROR =
  'Không thể ngừng xuất bản lúc này. Trang public hiện tại chưa bị thay đổi.'

export const normalizePublicUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null

  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

const normalizeServerPublication = (publication) => {
  const publicUrl = normalizePublicUrl(publication?.publicUrl)
  const status = publication?.status

  if (
    publication?.serverConfirmed !== true ||
    (status !== 'published' && status !== 'draft')
  ) {
    return {
      status: 'unknown',
      publicUrl: null,
      serverConfirmed: false,
    }
  }

  return {
    status,
    publicUrl,
    serverConfirmed: true,
  }
}

const normalizeUserMessage = (error, fallback) => {
  const message =
    typeof error?.userMessage === 'string' ? error.userMessage.trim() : ''
  return message ? message.slice(0, 300) : fallback
}

const runLocalCallback = (callback, publication) => {
  if (typeof callback !== 'function') return

  try {
    const callbackResult = callback(publication)
    if (callbackResult && typeof callbackResult.catch === 'function') {
      callbackResult.catch(() => {})
    }
  } catch {
    // Callback local không được thay đổi kết quả operation đã được server xác nhận.
  }
}

export const usePublishFlow = ({
  actionContext,
  publishAction,
  unpublishAction,
  serverPublication,
  onPublished,
  onUnpublished,
} = {}) => {
  const [flow, setFlow] = useState(() => ({
    state: 'closed',
    error: null,
    lastOperation: null,
    successOrigin: null,
  }))
  const [publication, setPublication] = useState(() =>
    normalizeServerPublication(serverPublication),
  )
  const mountedRef = useRef(true)
  const sessionIdRef = useRef(0)
  const operationIdRef = useRef(0)
  const operationInFlightRef = useRef(false)
  const flowRef = useRef(flow)
  const publicationRef = useRef(publication)
  const boundaryRef = useRef({
    actionContext,
    publishAction,
    unpublishAction,
    onPublished,
    onUnpublished,
  })

  flowRef.current = flow
  publicationRef.current = publication
  boundaryRef.current = {
    actionContext,
    publishAction,
    unpublishAction,
    onPublished,
    onUnpublished,
  }

  const updatePublication = useCallback((nextPublication) => {
    publicationRef.current = nextPublication
    setPublication(nextPublication)
  }, [])

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      operationIdRef.current += 1
      sessionIdRef.current += 1
      operationInFlightRef.current = false
    }
  }, [])

  useEffect(() => {
    if (
      flowRef.current.state !== 'closed' ||
      operationInFlightRef.current
    ) {
      return
    }

    const nextPublication = normalizeServerPublication(serverPublication)
    const currentPublication = publicationRef.current
    if (
      currentPublication.status === nextPublication.status &&
      currentPublication.publicUrl === nextPublication.publicUrl &&
      currentPublication.serverConfirmed === nextPublication.serverConfirmed
    ) {
      return
    }
    updatePublication(nextPublication)
  }, [flow.state, serverPublication, updatePublication])

  const open = useCallback(() => {
    if (operationInFlightRef.current) return

    sessionIdRef.current += 1
    operationIdRef.current += 1
    const isPublished =
      publicationRef.current.serverConfirmed &&
      publicationRef.current.status === 'published'

    setFlow({
      state: isPublished ? 'success' : 'confirm',
      error: null,
      lastOperation: null,
      successOrigin: isPublished ? 'existing' : null,
    })
  }, [])

  const close = useCallback(() => {
    if (operationInFlightRef.current) return false

    sessionIdRef.current += 1
    operationIdRef.current += 1
    setFlow({
      state: 'closed',
      error: null,
      lastOperation: null,
      successOrigin: null,
    })
    return true
  }, [])

  const runPublish = useCallback(async () => {
    if (operationInFlightRef.current) return

    const { publishAction: currentAction } = boundaryRef.current
    if (typeof currentAction !== 'function') {
      setFlow({
        state: 'unavailable',
        error: null,
        lastOperation: 'publish',
        successOrigin: null,
      })
      return
    }

    operationInFlightRef.current = true
    const operationId = ++operationIdRef.current
    const sessionId = sessionIdRef.current
    let nextPublication = null
    setFlow({
      state: 'publishing',
      error: null,
      lastOperation: 'publish',
      successOrigin: null,
    })

    try {
      const result = await currentAction(boundaryRef.current.actionContext)
      const publicUrl = normalizePublicUrl(result?.publicUrl)

      if (result?.status !== 'published' || !publicUrl) {
        throw { userMessage: 'Máy chủ chưa trả về đường dẫn public hợp lệ.' }
      }

      if (
        !mountedRef.current ||
        operationId !== operationIdRef.current ||
        sessionId !== sessionIdRef.current
      ) {
        return
      }

      nextPublication = {
        status: 'published',
        publicUrl,
        serverConfirmed: true,
      }
    } catch (error) {
      if (
        !mountedRef.current ||
        operationId !== operationIdRef.current ||
        sessionId !== sessionIdRef.current
      ) {
        return
      }

      setFlow({
        state: 'error',
        error: normalizeUserMessage(error, GENERIC_PUBLISH_ERROR),
        lastOperation: 'publish',
        successOrigin: null,
      })
    } finally {
      if (operationId === operationIdRef.current) {
        operationInFlightRef.current = false
      }
    }

    if (!nextPublication) return
    if (
      !mountedRef.current ||
      operationId !== operationIdRef.current ||
      sessionId !== sessionIdRef.current
    ) {
      return
    }

    updatePublication(nextPublication)
    setFlow({
      state: 'success',
      error: null,
      lastOperation: 'publish',
      successOrigin: 'operation',
    })
    runLocalCallback(boundaryRef.current.onPublished, nextPublication)
  }, [updatePublication])

  const runUnpublish = useCallback(async () => {
    if (operationInFlightRef.current) return

    const { unpublishAction: currentAction } = boundaryRef.current
    if (typeof currentAction !== 'function') {
      setFlow({
        state: 'unavailable',
        error: null,
        lastOperation: 'unpublish',
        successOrigin: null,
      })
      return
    }

    operationInFlightRef.current = true
    const operationId = ++operationIdRef.current
    const sessionId = sessionIdRef.current
    let nextPublication = null
    setFlow({
      state: 'unpublishing',
      error: null,
      lastOperation: 'unpublish',
      successOrigin: null,
    })

    try {
      const result = await currentAction(boundaryRef.current.actionContext)
      if (result?.status !== 'draft') {
        throw { userMessage: 'Máy chủ chưa xác nhận trạng thái draft.' }
      }

      if (
        !mountedRef.current ||
        operationId !== operationIdRef.current ||
        sessionId !== sessionIdRef.current
      ) {
        return
      }

      nextPublication = {
        ...publicationRef.current,
        status: 'draft',
        serverConfirmed: true,
      }
    } catch (error) {
      if (
        !mountedRef.current ||
        operationId !== operationIdRef.current ||
        sessionId !== sessionIdRef.current
      ) {
        return
      }

      setFlow({
        state: 'error',
        error: normalizeUserMessage(error, GENERIC_UNPUBLISH_ERROR),
        lastOperation: 'unpublish',
        successOrigin: null,
      })
    } finally {
      if (operationId === operationIdRef.current) {
        operationInFlightRef.current = false
      }
    }

    if (!nextPublication) return
    if (
      !mountedRef.current ||
      operationId !== operationIdRef.current ||
      sessionId !== sessionIdRef.current
    ) {
      return
    }

    updatePublication(nextPublication)
    setFlow({
      state: 'unpublish-success',
      error: null,
      lastOperation: 'unpublish',
      successOrigin: 'operation',
    })
    runLocalCallback(boundaryRef.current.onUnpublished, nextPublication)
  }, [updatePublication])

  const retry = useCallback(() => {
    if (operationInFlightRef.current) return
    if (flowRef.current.lastOperation === 'publish') runPublish()
    if (flowRef.current.lastOperation === 'unpublish') runUnpublish()
  }, [runPublish, runUnpublish])

  const goBack = useCallback(() => {
    if (operationInFlightRef.current) return
    setFlow((currentFlow) => ({
      state:
        currentFlow.lastOperation === 'unpublish'
          ? 'unpublish-confirm'
          : 'confirm',
      error: null,
      lastOperation: currentFlow.lastOperation,
      successOrigin: null,
    }))
  }, [])

  const showPublishConfirm = useCallback(() => {
    if (operationInFlightRef.current) return
    setFlow({
      state: 'confirm',
      error: null,
      lastOperation: 'publish',
      successOrigin: null,
    })
  }, [])

  const showUnpublishConfirm = useCallback(() => {
    if (
      operationInFlightRef.current ||
      !publicationRef.current.serverConfirmed ||
      publicationRef.current.status !== 'published'
    ) {
      return
    }

    setFlow({
      state: 'unpublish-confirm',
      error: null,
      lastOperation: 'unpublish',
      successOrigin: null,
    })
  }, [])

  const reportLinkError = useCallback(() => {
    if (operationInFlightRef.current) return
    setFlow({
      state: 'error',
      error: 'Đường dẫn public không hợp lệ hoặc không thể sử dụng an toàn.',
      lastOperation: null,
      successOrigin: null,
    })
  }, [])

  const isPublished =
    publication.serverConfirmed &&
    publication.status === 'published'
  const hasPublicUrl = Boolean(publication.publicUrl)
  const isRepublish =
    publication.serverConfirmed &&
    (publication.status === 'published' || hasPublicUrl)

  return {
    ...flow,
    isOpen: flow.state !== 'closed',
    isBusy: BUSY_STATES.has(flow.state),
    isPublished,
    hasPublicUrl,
    isRepublish,
    publicUrl: publication.publicUrl,
    open,
    close,
    confirmPublish: runPublish,
    confirmUnpublish: runUnpublish,
    retry,
    goBack,
    showPublishConfirm,
    showUnpublishConfirm,
    reportLinkError,
  }
}
