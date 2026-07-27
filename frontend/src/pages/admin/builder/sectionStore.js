// Lưu tạm "section mẫu" do admin dựng trong builder vào localStorage.
// MVP chưa có backend — sau này thay bằng Section Template Library API
// (create/update/get/delete), shape giữ nguyên { id, name, type, usedIn, elements }.
const KEY = 'amztech.sectionDrafts'

export const loadSectionDrafts = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || []
  } catch {
    return []
  }
}

export const getSectionDraft = (id) =>
  loadSectionDrafts().find((s) => String(s.id) === String(id)) || null

// Thêm mới (chưa có id trùng) hoặc cập nhật (id trùng) 1 section.
export const saveSectionDraft = (draft) => {
  const list = loadSectionDrafts()
  const i = list.findIndex((s) => String(s.id) === String(draft.id))
  if (i >= 0) list[i] = { ...list[i], ...draft }
  else list.unshift(draft)
  localStorage.setItem(KEY, JSON.stringify(list))
  return draft
}

export const deleteSectionDraft = (id) => {
  const next = loadSectionDrafts().filter((s) => String(s.id) !== String(id))
  localStorage.setItem(KEY, JSON.stringify(next))
}
