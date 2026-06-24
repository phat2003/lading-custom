import Icon from './Icon'

// Template (System / User Template).
export default function LayoutTemplateIcon(props) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="18" height="7" rx="1" />
      <rect x="3" y="14" width="9" height="7" rx="1" />
      <rect x="16" y="14" width="5" height="7" rx="1" />
    </Icon>
  )
}
