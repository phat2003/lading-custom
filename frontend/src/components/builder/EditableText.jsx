import { useEffect, useRef } from 'react'

// Ô sửa văn bản trực tiếp (contentEditable). Nội dung set qua ref để React
// không reconcile lại text -> tránh nhảy con trỏ.
const EditableText = ({ element, onCommit }) => {
  const ref = useRef(null)
  const { style } = element

  useEffect(() => {
    const node = ref.current
    if (!node) return
    node.innerText = element.content
    node.focus()
    const range = document.createRange()
    range.selectNodeContents(node)
    range.collapse(false)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(range)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onCommit(e.currentTarget.innerText)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          e.currentTarget.blur()
        }
      }}
      style={{
        fontSize: style.fontSize,
        fontFamily: style.fontFamily,
        fontWeight: style.fontWeight,
        fontStyle: style.fontStyle,
        textDecoration: style.textDecoration,
        textAlign: style.textAlign,
        color: style.color,
      }}
      className="h-full w-full cursor-text outline-none"
    />
  )
}

export default EditableText
