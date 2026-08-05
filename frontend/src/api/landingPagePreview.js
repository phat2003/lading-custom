import { createApiContractError } from './apiError'
import { requestApi } from './client'

const pathId = (id) => encodeURIComponent(String(id))
const DEVICE_IDS = new Set(['desktop', 'tablet', 'mobile'])

const normalizeDevice = (device) =>
  DEVICE_IDS.has(device) ? device : 'desktop'

/** @typedef {{ signal?: AbortSignal }} RequestOptions */

export const landingPagePreviewApi = {
  /**
   * Lấy HTML preview có xác thực. Chưa được nối vào local realtime preview ở FE-5B.
   * @param {string} landingPageId
   * @param {'desktop'|'tablet'|'mobile'} device
   * @param {RequestOptions} [options]
   */
  getAuthenticated: async (
    landingPageId,
    device = 'desktop',
    { signal } = {},
  ) => {
    const { data } = await requestApi({
      method: 'get',
      url: `/landing-pages/${pathId(landingPageId)}/preview`,
      params: { device: normalizeDevice(device) },
      signal,
    })

    if (!data || typeof data.html !== 'string') {
      throw createApiContractError(
        'Máy chủ chưa trả về bản xem trước hợp lệ.',
      )
    }

    return {
      html: data.html,
      updatedAt:
        typeof data.updated_at === 'string' ? data.updated_at : null,
    }
  },

  /** @param {string} landingPageId @param {RequestOptions} [options] */
  generateStatic: async (landingPageId, { signal } = {}) => {
    const { data } = await requestApi({
      method: 'post',
      url: `/landing-pages/${pathId(landingPageId)}/generate-static`,
      signal,
    })

    if (!data || typeof data.html !== 'string') {
      throw createApiContractError(
        'Máy chủ chưa trả về nội dung trang tĩnh hợp lệ.',
      )
    }

    return { html: data.html }
  },
}
