import Icon from './Icon'

// Trang chủ công khai (nút "Xem trang chủ" ở header admin).
export default function HomeIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </Icon>
  )
}
