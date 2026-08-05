import { createApiContractError } from './apiError'
import { requestApi } from './client'

const pathId = (id) => encodeURIComponent(String(id))

const normalizeAbsolutePublicUrl = (value) => {
  if (typeof value !== 'string' || !value.trim()) return null

  try {
    const url = new URL(value.trim())
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url.toString()
  } catch {
    return null
  }
}

/** @typedef {{ signal?: AbortSignal }} RequestOptions */

export const landingPagePublicationApi = {
  /**
   * @param {string} landingPageId
   * @param {RequestOptions} [options]
   * @returns {Promise<{ status: 'published', publicUrl: string }>}
   */
  publish: async (landingPageId, { signal } = {}) => {
    const { data } = await requestApi(
      {
        method: 'post',
        url: `/landing-pages/${pathId(landingPageId)}/publish`,
        signal,
      },
      { outcomeUnknownOnNetwork: true },
    )
    const publicUrl = normalizeAbsolutePublicUrl(data?.public_link)

    if (data?.status !== 'published' || !publicUrl) {
      throw createApiContractError(
        'Máy chủ chưa xác nhận trạng thái published và đường dẫn public hợp lệ.',
      )
    }

    return { status: 'published', publicUrl }
  },

  /**
   * @param {string} landingPageId
   * @param {RequestOptions} [options]
   * @returns {Promise<{ status: 'draft' }>}
   */
  unpublish: async (landingPageId, { signal } = {}) => {
    const { data } = await requestApi(
      {
        method: 'post',
        url: `/landing-pages/${pathId(landingPageId)}/unpublish`,
        signal,
      },
      { outcomeUnknownOnNetwork: true },
    )

    if (data?.status !== 'draft') {
      throw createApiContractError(
        'Máy chủ chưa xác nhận Landing Page đã trở về trạng thái draft.',
      )
    }

    return { status: 'draft' }
  },
}
