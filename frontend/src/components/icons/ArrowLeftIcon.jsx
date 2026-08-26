import Icon from './Icon'

// Quay lại trang trước / về trang chủ.
export default function ArrowLeftIcon(props) {
  return (
    <Icon {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </Icon>
  )
}
