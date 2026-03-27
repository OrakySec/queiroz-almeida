import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
})

// Injeta token JWT em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  const token = Cookies.get('qa_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redireciona para login se token expirar (401)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      Cookies.remove('qa_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
