import { useCallback, useEffect, useRef, useState } from 'react'

const PREVIEW_DEBOUNCE_MS = 300
const PREVIEW_ERROR_MESSAGE = 'Không thể tạo bản xem trước cục bộ.'

function clonePreviewSections(sections) {
  const sourceSections = Array.isArray(sections) ? sections : []
  const snapshot =
    typeof structuredClone === 'function'
      ? structuredClone(sourceSections)
      : JSON.parse(JSON.stringify(sourceSections))

  snapshot.forEach((section) => {
    if (!section || typeof section !== 'object') {
      throw new Error('Invalid preview section')
    }

    if (section.type === 'columns' && typeof section.text !== 'string') {
      throw new Error('Invalid columns content')
    }
  })

  return snapshot
}

function createInitialPreviewState(sections) {
  try {
    return {
      previewSections: clonePreviewSections(sections),
      status: 'ready',
      lastUpdatedAt: Date.now(),
      error: null,
      draftRevision: 0,
      previewRevision: 0,
    }
  } catch {
    return {
      previewSections: [],
      status: 'error',
      lastUpdatedAt: null,
      error: PREVIEW_ERROR_MESSAGE,
      draftRevision: 0,
      previewRevision: 0,
    }
  }
}

export const useRealtimePreview = (sections) => {
  const [previewState, setPreviewState] = useState(() =>
    createInitialPreviewState(sections),
  )
  const mountedRef = useRef(true)
  const latestSectionsRef = useRef(sections)
  const lastDraftRef = useRef(sections)
  const draftRevisionRef = useRef(0)
  const generationIdRef = useRef(0)
  const debounceTimerRef = useRef(null)
  const generationTimerRef = useRef(null)

  latestSectionsRef.current = sections

  const clearScheduledUpdates = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    if (generationTimerRef.current !== null) {
      window.clearTimeout(generationTimerRef.current)
      generationTimerRef.current = null
    }
  }, [])

  const generatePreview = useCallback((revision, sourceSections) => {
    if (!mountedRef.current) return

    const generationId = ++generationIdRef.current
    setPreviewState((currentState) => ({
      ...currentState,
      status: 'updating',
      error: null,
      draftRevision: revision,
    }))

    generationTimerRef.current = window.setTimeout(() => {
      generationTimerRef.current = null

      try {
        const nextPreviewSections = clonePreviewSections(sourceSections)

        if (
          !mountedRef.current ||
          generationId !== generationIdRef.current ||
          revision !== draftRevisionRef.current
        ) {
          return
        }

        setPreviewState({
          previewSections: nextPreviewSections,
          status: 'ready',
          lastUpdatedAt: Date.now(),
          error: null,
          draftRevision: revision,
          previewRevision: revision,
        })
      } catch {
        if (
          !mountedRef.current ||
          generationId !== generationIdRef.current ||
          revision !== draftRevisionRef.current
        ) {
          return
        }

        setPreviewState((currentState) => ({
          ...currentState,
          status: 'error',
          error: PREVIEW_ERROR_MESSAGE,
          draftRevision: revision,
        }))
      }
    }, 0)
  }, [])

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      generationIdRef.current += 1
      clearScheduledUpdates()
    }
  }, [clearScheduledUpdates])

  useEffect(() => {
    if (lastDraftRef.current === sections) return undefined

    lastDraftRef.current = sections
    clearScheduledUpdates()
    generationIdRef.current += 1

    const nextRevision = draftRevisionRef.current + 1
    draftRevisionRef.current = nextRevision

    setPreviewState((currentState) => ({
      ...currentState,
      status: 'dirty',
      error: null,
      draftRevision: nextRevision,
    }))

    debounceTimerRef.current = window.setTimeout(() => {
      debounceTimerRef.current = null
      generatePreview(nextRevision, latestSectionsRef.current)
    }, PREVIEW_DEBOUNCE_MS)

    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
    }
  }, [clearScheduledUpdates, generatePreview, sections])

  const retry = useCallback(() => {
    clearScheduledUpdates()
    generationIdRef.current += 1
    generatePreview(draftRevisionRef.current, latestSectionsRef.current)
  }, [clearScheduledUpdates, generatePreview])

  const reportRenderError = useCallback(() => {
    if (!mountedRef.current) return

    generationIdRef.current += 1
    setPreviewState((currentState) => ({
      ...currentState,
      status: 'error',
      error: PREVIEW_ERROR_MESSAGE,
    }))
  }, [])

  return {
    ...previewState,
    retry,
    reportRenderError,
  }
}
