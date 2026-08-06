import { createContext, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'appTheme'
const ThemeContext = createContext(null)

// Giao diện sáng/tối dùng chung cho cả khu Admin lẫn Template Builder.
// Giá trị được gắn vào thẻ gốc qua data-mode; toàn bộ màu đọc từ biến CSS
// (--bd-*) khai báo trong index.css nên không cần truyền props xuống từng cấp.
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem(STORAGE_KEY) || 'dark')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme phải dùng bên trong ThemeProvider')
  return ctx
}
