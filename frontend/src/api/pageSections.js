import { createApiContractError } from './apiError'
import { requestApi } from './client'

const pathId = (id) => encodeURIComponent(String(id))

const requireSection = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw createApiContractError(
      'Máy chủ chưa trả về dữ liệu Section hợp lệ.',
    )
  }
  return data
}

const updateSection = async (id, payload, { signal } = {}) => {
  const { data } = await requestApi({
    method: 'put',
    url: `/sections/${pathId(id)}`,
    data: payload,
    signal,
  })
  return requireSection(data)
}

/** @typedef {{ signal?: AbortSignal }} RequestOptions */

export const pageSectionsApi = {
  /** @param {string} landingPageId @param {RequestOptions} [options] */
  list: async (landingPageId, { signal } = {}) => {
    const { data } = await requestApi({
      method: 'get',
      url: '/sections',
      params: { page_id: landingPageId },
      signal,
    })
    if (!Array.isArray(data)) {
      throw createApiContractError(
        'Máy chủ chưa trả về danh sách Section hợp lệ.',
      )
    }
    return data
  },

  /**
   * @param {{ landing_page_id: string, section_type: string, order_index: number, content: object }} payload
   * @param {RequestOptions} [options]
   */
  create: async (payload, { signal } = {}) => {
    const { data } = await requestApi({
      method: 'post',
      url: '/sections',
      data: payload,
      signal,
    })
    return requireSection(data)
  },

  /**
   * @param {string} id
   * @param {{ content?: object, order_index?: number, is_visible?: boolean }} payload
   * @param {RequestOptions} [options]
   */
  update: updateSection,

  /** @param {string} id @param {number} orderIndex @param {RequestOptions} [options] */
  reorder: (id, orderIndex, options) =>
    updateSection(id, { order_index: orderIndex }, options),

  /** @param {string} id @param {RequestOptions} [options] */
  remove: async (id, { signal } = {}) => {
    await requestApi({
      method: 'delete',
      url: `/sections/${pathId(id)}`,
      signal,
    })
  },
}
