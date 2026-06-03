import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://ryanvp10-tremorid-api.hf.space'
export const API_BASE = `${API_URL}/api`

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const quakeService = {
  getAll: () => api.get('/quakes'),
  getLatest: () => api.get('/quakes/latest'),
  getById: (id) => api.get(`/quakes/${id}`),
  getNear: (lat, lon, radius) => api.get('/quakes/near', { params: { lat, lon, radius } }),
  getAiSummary: (id) => api.get(`/ai/summary/${id}`),
  getDigest: () => api.get('/ai/digest'),
}

export default api
