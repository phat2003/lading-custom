import api from './client'

// Upload ảnh cho khu admin (thumbnail template...).
//   POST /api/v1/admin/media/upload   — multipart/form-data, field "file"
//
// Admin endpoint trả về:
//   { success, message, data: { file_url } }
export const mediaApi = {
  // POST /api/v1/upload — multipart/form-data, field "file".
  // Validation theo BA của User Editor được thực hiện trước khi gọi API này.
  uploadUserImage: (file, config) => {
    const data = new FormData()
    data.append('file', file)
    return api.post('/upload', data, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  uploadImage: (file) => {
    const data = new FormData()
    data.append('file', file)
    // Ghi đè Content-Type để axios tự sinh boundary cho multipart.
    return api.post('/admin/media/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

export const mapMediaAssetFromApi = (asset) => {
  if (!asset || typeof asset !== 'object') return null
  const fileUrl = typeof asset.file_url === 'string' ? asset.file_url.trim() : ''
  if (!asset.asset_id || !fileUrl) return null

  return {
    id: asset.asset_id,
    ownerId: asset.owner_id || null,
    landingPageId: asset.landing_page_id || null,
    fileUrl,
    fileType: asset.file_type || '',
    fileSize: Number(asset.file_size) || 0,
    createdAt: asset.created_at || null,
  }
}
