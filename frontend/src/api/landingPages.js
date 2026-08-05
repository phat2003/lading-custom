import { createApiContractError } from './apiError'
import { requestApi } from './client'

const pathId = (id) => encodeURIComponent(String(id))

const requireObject = (data) => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw createApiContractError(
      'Máy chủ chưa trả về dữ liệu Landing Page hợp lệ.',
    )
  }
  return data
}

/** @typedef {{ signal?: AbortSignal }} RequestOptions */

export const landingPagesApi = {
  /** @param {string} projectId @param {RequestOptions} [options] */
  list: async (projectId, { signal } = {}) => {
    const { data } = await requestApi({
      method: 'get',
      url: '/pages',
      params: { project_id: projectId },
      signal,
    })
    if (!Array.isArray(data)) {
      throw createApiContractError(
        'Máy chủ chưa trả về danh sách Landing Page hợp lệ.',
      )
    }
    return data
  },

  /** @param {string} id @param {RequestOptions} [options] */
  get: async (id, { signal } = {}) => {
    const { data } = await requestApi({
      method: 'get',
      url: `/pages/${pathId(id)}`,
      signal,
    })
    return requireObject(data)
  },

  /** @param {{ project_id: string, name: string }} payload @param {RequestOptions} [options] */
  create: async (payload, { signal } = {}) => {
    const { data } = await requestApi({
      method: 'post',
      url: '/pages',
      data: payload,
      signal,
    })
    return requireObject(data)
  },

  /** @param {string} id @param {{ name?: string }} payload @param {RequestOptions} [options] */
  update: async (id, payload, { signal } = {}) => {
    const { data } = await requestApi({
      method: 'put',
      url: `/pages/${pathId(id)}`,
      data: payload,
      signal,
    })
    return requireObject(data)
  },
}
