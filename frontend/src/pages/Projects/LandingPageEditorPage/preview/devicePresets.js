export const DEVICE_PRESETS = Object.freeze([
  Object.freeze({
    id: 'desktop',
    label: 'Desktop',
    width: 1920,
    height: 1080,
    editable: true,
  }),
  Object.freeze({
    id: 'tablet',
    label: 'Tablet',
    width: 1024,
    height: 768,
    editable: false,
  }),
  Object.freeze({
    id: 'mobile',
    label: 'Mobile',
    width: 360,
    height: 800,
    editable: false,
  }),
])

const DEVICE_PRESETS_BY_ID = Object.fromEntries(
  DEVICE_PRESETS.map((preset) => [preset.id, preset]),
)

export function getDevicePreset(deviceId) {
  return DEVICE_PRESETS_BY_ID[deviceId] || DEVICE_PRESETS_BY_ID.desktop
}
