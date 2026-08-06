import api from './client'

// Upload ảnh cho khu admin (thumbnail template...).
//   POST /api/v1/admin/media/upload   — multipart/form-data, field "file"
//
// Backend chỉ nhận JPG / PNG / WebP, tối đa 5MB, và trả về:
//   { success, message, data: { file_url } }
export const mediaApi = {
  uploadImage: (file) => {
    const data = new FormData()
    data.append('file', file)
    // Ghi đè Content-Type để axios tự sinh boundary cho multipart.
    return api.post('/admin/media/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
