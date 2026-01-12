import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const uploadElectoralRoll = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  const response = await api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export const getUploads = async () => {
  const response = await api.get('/api/uploads')
  return response.data
}

export const compareRolls = async (oldUploadId, newUploadId) => {
  const response = await api.post('/api/compare', {
    old_upload_id: oldUploadId,
    new_upload_id: newUploadId,
  })
  return response.data
}

export default api
