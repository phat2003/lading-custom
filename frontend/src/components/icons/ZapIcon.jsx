import Icon from './Icon'

// Tia sét — dùng làm logo thương hiệu (Amazing Tech).
// Fill đặc để nhìn như logo; đổi màu qua class text-*.
export default function ZapIcon(props) {
  return (
    <Icon {...props}>
      <polygon
        points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
        fill="currentColor"
      />
    </Icon>
  )
}
