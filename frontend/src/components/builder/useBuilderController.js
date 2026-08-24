import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildMobileLayout, clampBox, viewAll, viewOf, writeLayer } from './deviceLayout'
import { cloneLibraryBlock } from './sectionLibrary'

const newId = () =>
  globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`

const cloneStyle = (style) => ({ ...(style || {}) })

// Controller dùng chung cho Admin Builder và User Landing Page Editor.
// Persistence không nằm ở đây: mỗi domain tự hydrate/serialize dữ liệu server của mình.
export const useBuilderController = ({
  initialElements = [],
  initialPanel = 'add',
  settings,
  onMutate,
  pageHeight,
}) => {
  const [device, setDevice] = useState('desktop')
  const [elements, setElements] = useState(initialElements)
  const [past, setPast] = useState([])
  const [future, setFuture] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [activePanel, setActivePanel] = useState(initialPanel)
  const [recent, setRecent] = useState([])
  const elementsRef = useRef(elements)
  const pastRef = useRef(past)
  const futureRef = useRef(future)

  useEffect(() => {
    elementsRef.current = elements
  }, [elements])

  useEffect(() => {
    pastRef.current = past
  }, [past])

  useEffect(() => {
    futureRef.current = future
  }, [future])

  const pageWidth =
    (device === 'mobile' ? settings?.mobileWidth : settings?.desktopWidth) ||
    (device === 'mobile' ? 390 : 896)
  const viewElements = useMemo(() => viewAll(elements, device), [elements, device])
  const selected = viewElements.find((element) => element.id === selectedId) || null

  const markMutated = useCallback(() => onMutate?.(), [onMutate])

  const replaceElements = useCallback((nextElements) => {
    const next = typeof nextElements === 'function' ? nextElements(elementsRef.current) : nextElements
    elementsRef.current = next
    setElements(next)
    pastRef.current = []
    futureRef.current = []
    setPast([])
    setFuture([])
    setSelectedId(null)
  }, [])

  const pushHistory = useCallback(() => {
    const nextPast = [...pastRef.current, elementsRef.current]
    pastRef.current = nextPast
    futureRef.current = []
    setPast(nextPast)
    setFuture([])
  }, [])

  const commit = useCallback(
    (updater) => {
      const current = elementsRef.current
      const next = typeof updater === 'function' ? updater(current) : updater
      if (next === current) return false
      const nextPast = [...pastRef.current, current]
      pastRef.current = nextPast
      futureRef.current = []
      setPast(nextPast)
      setFuture([])
      elementsRef.current = next
      setElements(next)
      markMutated()
      return true
    },
    [markMutated],
  )

  const undo = useCallback(() => {
    const history = pastRef.current
    if (!history.length) return
    const previous = history[history.length - 1]
    const nextPast = history.slice(0, -1)
    const nextFuture = [elementsRef.current, ...futureRef.current]
    pastRef.current = nextPast
    futureRef.current = nextFuture
    elementsRef.current = previous
    setPast(nextPast)
    setFuture(nextFuture)
    setElements(previous)
    setSelectedId(null)
    markMutated()
  }, [markMutated])

  const redo = useCallback(() => {
    const history = futureRef.current
    if (!history.length) return
    const next = history[0]
    const nextPast = [...pastRef.current, elementsRef.current]
    const nextFuture = history.slice(1)
    pastRef.current = nextPast
    futureRef.current = nextFuture
    elementsRef.current = next
    setPast(nextPast)
    setFuture(nextFuture)
    setElements(next)
    setSelectedId(null)
    markMutated()
  }, [markMutated])

  const changeDevice = useCallback(
    (nextDevice) => {
      if (nextDevice === 'mobile' && elementsRef.current.some((element) => !element.mobile)) {
        const scale = (settings?.mobileWidth || 390) / (settings?.desktopWidth || 896)
        commit((list) => buildMobileLayout(list, scale))
      }
      setDevice(nextDevice)
    },
    [commit, settings?.desktopWidth, settings?.mobileWidth],
  )

  const boundsFor = useCallback(
    (element, list = elementsRef.current) => {
      if (!element.parentId) {
        return {
          width: pageWidth,
          height: Number.isFinite(pageHeight) ? pageHeight : Infinity,
        }
      }
      const parent = list.find((candidate) => candidate.id === element.parentId)
      const parentView = parent ? viewOf(parent, device) : null
      return {
        width: parentView?.style?.width || pageWidth,
        height: parentView?.style?.height || Infinity,
      }
    },
    [device, pageHeight, pageWidth],
  )

  const useRecent = useCallback(
    (item) =>
      setRecent((list) => [item, ...list.filter((candidate) => candidate.label !== item.label)].slice(0, 6)),
    [],
  )

  const addElement = useCallback(
    (payload, x, y, parentId = null) => {
      const element = {
        id: newId(),
        type: payload.type,
        content: payload.content,
        x,
        y,
        parentId,
        style: cloneStyle(payload.style),
      }
      commit((list) => [...list, element])
      setSelectedId(element.id)
    },
    [commit],
  )

  const addBlock = useCallback(
    (blockDefinition, x, y) => {
      const graph = cloneLibraryBlock(blockDefinition, { x, y })
      const section = graph.find(
        (element) => element.type === 'section' && !element.parentId,
      )
      if (!section) return
      commit((list) => [...list, ...graph])
      setSelectedId(section.id)
    },
    [commit],
  )

  // Gesture chỉ tạo một mốc history; các frame move/resize sau đó dùng state trực tiếp.
  const beginGesture = useCallback(() => {
    pushHistory()
    markMutated()
  }, [markMutated, pushHistory])

  const moveElement = useCallback(
    (id, x, y) => {
      setElements((list) => {
        const next = list.map((element) => {
          if (element.id !== id) return element
          const view = viewOf(element, device)
          const safe = clampBox(
            { x, y, width: view.style?.width, height: view.style?.height },
            boundsFor(element, list),
          )
          return writeLayer(element, device, safe)
        })
        elementsRef.current = next
        return next
      })
    },
    [boundsFor, device],
  )

  const resizeElement = useCallback(
    (id, nextBox) => {
      setElements((list) => {
        const next = list.map((element) => {
          if (element.id !== id) return element
          const bounds = boundsFor(element, list)
          const width = Math.min(nextBox.width, Math.max(20, bounds.width - nextBox.x))
          const safe = clampBox(
            { x: nextBox.x, y: nextBox.y, width, height: nextBox.height },
            bounds,
          )
          return writeLayer(element, device, {
            ...safe,
            style: { width, height: nextBox.height },
          })
        })
        elementsRef.current = next
        return next
      })
    },
    [boundsFor, device],
  )

  const updateElement = useCallback(
    (id, patch) =>
      commit((list) => {
        const index = list.findIndex((element) => element.id === id)
        if (index < 0) return list
        const next = list.slice()
        next[index] = writeLayer(list[index], device, patch)
        return next
      }),
    [commit, device],
  )

  // Một transaction generic tạo đúng một history step. Domain orchestration có thể dùng
  // cho mutation atomic như document/section reorder mà không đưa business rule vào core.
  const transformElements = useCallback((updater) => commit(updater), [commit])

  const duplicateElement = useCallback(
    (id) => {
      const list = elementsRef.current
      const source = list.find((element) => element.id === id)
      if (!source) return
      const idMap = new Map([[id, newId()]])
      let pending = list.filter((element) => element.parentId === id)
      while (pending.length) {
        const nextPending = []
        pending.forEach((element) => {
          idMap.set(element.id, newId())
          nextPending.push(...list.filter((candidate) => candidate.parentId === element.id))
        })
        pending = nextPending
      }
      const copies = list
        .filter((element) => idMap.has(element.id))
        .map((element) => ({
          ...element,
          id: idMap.get(element.id),
          parentId: element.parentId ? idMap.get(element.parentId) || element.parentId : null,
          x: element.id === id ? (element.x || 0) + 16 : element.x,
          y: element.id === id ? (element.y || 0) + 16 : element.y,
          style: cloneStyle(element.style),
          mobile: element.mobile ? { ...element.mobile, style: cloneStyle(element.mobile.style) } : undefined,
          serverSectionId: undefined,
          orderIndex: undefined,
        }))
      commit((elementsList) => [...elementsList, ...copies])
      setSelectedId(idMap.get(id))
    },
    [commit],
  )

  const deleteElement = useCallback(
    (id) => {
      const list = elementsRef.current
      const removed = new Set([id])
      let changed = true
      while (changed) {
        changed = false
        list.forEach((element) => {
          if (element.parentId && removed.has(element.parentId) && !removed.has(element.id)) {
            removed.add(element.id)
            changed = true
          }
        })
      }
      if (!list.some((element) => removed.has(element.id))) return
      commit((elementsList) => elementsList.filter((element) => !removed.has(element.id)))
      setSelectedId((current) => (removed.has(current) ? null : current))
    },
    [commit],
  )

  const toggleHidden = useCallback(
    (id) =>
      commit((list) =>
        list.map((element) =>
          element.id === id ? { ...element, hidden: !element.hidden } : element,
        ),
      ),
    [commit],
  )

  const moveLayer = useCallback(
    (id, direction) =>
      commit((list) => {
        const element = list.find((candidate) => candidate.id === id)
        if (!element) return list
        const siblings = list.filter((candidate) => candidate.parentId === element.parentId)
        const index = siblings.indexOf(element)
        const swap = direction === 'forward' ? siblings[index + 1] : siblings[index - 1]
        if (!swap) return list
        const next = [...list]
        const firstIndex = next.indexOf(element)
        const secondIndex = next.indexOf(swap)
        ;[next[firstIndex], next[secondIndex]] = [next[secondIndex], next[firstIndex]]
        return next
      }),
    [commit],
  )

  const nudge = useCallback(
    (dx, dy) => {
      if (!selectedId) return
      commit((list) =>
        list.map((element) => {
          if (element.id !== selectedId) return element
          const view = viewOf(element, device)
          const safe = clampBox(
            {
              x: view.x + dx,
              y: view.y + dy,
              width: view.style?.width,
              height: view.style?.height,
            },
            boundsFor(element, list),
          )
          return writeLayer(element, device, safe)
        }),
      )
    },
    [boundsFor, commit, device, selectedId],
  )

  const fitContentToWidth = useCallback(() => {
    const roots = viewAll(elementsRef.current, device).filter((element) => !element.parentId)
    const contentWidth = roots.reduce(
      (max, element) => Math.max(max, (element.x || 0) + (element.style?.width || 0)),
      0,
    )
    if (contentWidth <= pageWidth) return
    const scale = pageWidth / contentWidth
    const scaleNumber = (value) => (typeof value === 'number' ? Math.round(value * scale) : value)
    commit((list) =>
      list.map((element) => {
        const view = viewOf(element, device)
        return writeLayer(element, device, {
          x: scaleNumber(view.x),
          y: scaleNumber(view.y),
          style: {
            width: scaleNumber(view.style?.width),
            height: scaleNumber(view.style?.height),
            fontSize: scaleNumber(view.style?.fontSize),
          },
        })
      }),
    )
  }, [commit, device, pageWidth])

  useEffect(() => {
    const onKeyDown = (event) => {
      const target = event.target
      const typing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      const control = event.ctrlKey || event.metaKey
      const key = event.key.toLowerCase()
      if (control && key === 'z') {
        event.preventDefault()
        event.shiftKey ? redo() : undo()
        return
      }
      if (control && key === 'y') {
        event.preventDefault()
        redo()
        return
      }
      if (typing) return
      if (control && key === 'd') {
        event.preventDefault()
        if (selectedId) duplicateElement(selectedId)
        return
      }
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedId) {
        event.preventDefault()
        deleteElement(selectedId)
        return
      }
      if (selectedId && event.key.startsWith('Arrow')) {
        event.preventDefault()
        const step = event.shiftKey ? 10 : 1
        if (event.key === 'ArrowUp') nudge(0, -step)
        if (event.key === 'ArrowDown') nudge(0, step)
        if (event.key === 'ArrowLeft') nudge(-step, 0)
        if (event.key === 'ArrowRight') nudge(step, 0)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [deleteElement, duplicateElement, nudge, redo, selectedId, undo])

  return {
    device,
    elements,
    viewElements,
    selected,
    selectedId,
    activePanel,
    recent,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    setSelectedId,
    setActivePanel,
    togglePanel: (panel) => setActivePanel((current) => (current === panel ? null : panel)),
    useRecent,
    replaceElements,
    changeDevice,
    undo,
    redo,
    addElement,
    addBlock,
    beginGesture,
    moveElement,
    resizeElement,
    updateElement,
    transformElements,
    duplicateElement,
    deleteElement,
    toggleHidden,
    moveLayer,
    fitContentToWidth,
  }
}
