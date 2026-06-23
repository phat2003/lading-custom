import Icon from './Icon'

// Tay cầm kéo-thả (drag handle) cho section list.
export default function GripVerticalIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="5" r="1" fill="currentColor" />
      <circle cx="9" cy="12" r="1" fill="currentColor" />
      <circle cx="9" cy="19" r="1" fill="currentColor" />
      <circle cx="15" cy="5" r="1" fill="currentColor" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
      <circle cx="15" cy="19" r="1" fill="currentColor" />
    </Icon>
  )
}
