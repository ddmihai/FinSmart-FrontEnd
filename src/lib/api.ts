import axios from 'axios'

let resolvedBase: string = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_API_BASE || 'http://localhost:4000'
// Safety: if running on Render and base still points to localhost, override with production URL
if (typeof window !== 'undefined') {
  const host = window.location.hostname
  const isRender = host.endsWith('onrender.com')
  if (isRender && (!resolvedBase || resolvedBase.includes('localhost'))) {
    resolvedBase = 'https://finsmart-backend-558n.onrender.com'
  }
}
export const apiBaseUrl: string = resolvedBase

// Track whether a refresh cookie likely exists (from diagnostics or login)
let canRefresh = false
export function setCanRefresh(v: boolean) { canRefresh = v }

// Fetch server-side diagnostics to detect refresh-cookie presence and aid troubleshooting
export async function getDiagnostics() {
  const r = await api.get('/api/diagnostics')
  const has = Boolean(r.data?.cookies?.hasRefreshToken)
  canRefresh = has
  return r.data
}

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
  // Always attach Authorization if we have a token
  if (accessToken) {
    config.headers = config.headers || {}
    if (!('Authorization' in config.headers)) {
      (config.headers as any)['Authorization'] = `Bearer ${accessToken}`
    }
  }
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
    const isAuthPath = url.includes('/api/auth/login') || url.includes('/api/auth/signup') || url.includes('/api/auth/refresh') || url.includes('/api/security/csrf-token') || url.includes('/api/diagnostics')
    if (error.response?.status === 401 && !original._retry && !isAuthPath && canRefresh) {
      if (refreshing) {
        await new Promise<void>((resolve) => pending.push(resolve))
      } else {
        refreshing = true
        try {
          const res = await api.post('/api/auth/refresh')
          const token = res.data?.accessToken
          if (token) setAccessToken(token)
          else canRefresh = false
        } catch {
          setAccessToken(null)
          canRefresh = false
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
