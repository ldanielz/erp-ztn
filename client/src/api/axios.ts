import axios from 'axios'

const instance = axios.create({
  // Default to backend dev server if VITE_API_BASE_URL not provided
  baseURL: (import.meta.env as any).VITE_API_BASE_URL || 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
})

// We no longer rely on storing Authorization header by default.
// Authentication is cookie-based (httpOnly). Keep helper exported for compatibility.
export function setAuthToken(token: string | null) {
  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete instance.defaults.headers.common['Authorization']
  }
}

export default instance
