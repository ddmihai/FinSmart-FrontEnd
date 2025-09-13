import axios from 'axios'

export const apiBaseUrl: string = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000'

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
})

let accessToken: string | null = null
let csrfToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export async function ensureCsrf() {
  if (csrfToken) return csrfToken
  const res = await api.get('/api/security/csrf-token')
  csrfToken = res.data?.csrfToken
  if (csrfToken) api.defaults.headers.common['x-csrf-token'] = csrfToken
  return csrfToken
}

api.interceptors.request.use(async (config) => {
  if (!csrfToken) {
    const url = (config.url || '').toString()
    const isCsrfEndpoint = url.includes('/api/security/csrf-token')
    if (!isCsrfEndpoint) {
      await ensureCsrf()
    }
  }
  return config
})

let refreshing = false
let pending: Array<() => void> = []

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config
    const url = (original?.url || '').toString()
    const isAuthPath = url.includes('/api/auth/login') || url.includes('/api/auth/signup') || url.includes('/api/auth/refresh') || url.includes('/api/security/csrf-token')
    if (error.response?.status === 401 && !original._retry && !isAuthPath) {
      if (refreshing) {
        await new Promise<void>((resolve) => pending.push(resolve))
      } else {
        refreshing = true
        try {
          const res = await api.post('/api/auth/refresh')
          const token = res.data?.accessToken
          if (token) setAccessToken(token)
        } catch {
          setAccessToken(null)
        } finally {
          refreshing = false
          pending.forEach((fn) => fn())
          pending = []
        }
      }
      original._retry = true
      return api(original)
    }
    return Promise.reject(error)
  }
)

export default api
