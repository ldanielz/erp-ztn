import React, { createContext, useContext, useEffect, useState } from 'react'
import axios from '../api/axios'

type User = {
  sub?: string | number
  email?: string
  name?: string
  role?: string
}

 type AuthContextType = {
   user: User | null
   isAuthenticated: boolean
   login: (token?: string) => Promise<void>
   logout: () => void
   refreshUserFromServer?: () => Promise<void>
 }

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function decodeJwt(token: string): User | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    // base64url -> base64
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=')
    const json = atob(padded)
    return JSON.parse(json)
  } catch (err) {
    return null
  }
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

 export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
   const [user, setUser] = useState<User | null>(null)

   useEffect(() => {
     // Try to fetch current user from cookie (httpOnly) via /api/auth/me
     ;(async () => {
       try {
         const resp = await axios.get('/api/auth/me')
         if (resp?.data) {
           setUser(resp.data)
         }
       } catch (e) {
         // not authenticated
       }
     })()
   }, [])

   const login = async (token?: string) => {
     // Server sets httpOnly cookie; optionally decode token for immediate UX
     if (token) {
       const u = decodeJwt(token)
       if (u) setUser(u)
     }
     // ensure we fetch authoritative user from server
     try {
       const resp = await axios.get('/api/auth/me')
       if (resp?.data) setUser(resp.data)
     } catch (e) {
       // ignore
     }
   }

   // update user from cookie-backed /me endpoint
   const refreshUserFromServer = async () => {
     try {
       const resp = await axios.get('/api/auth/me')
       if (resp?.data) setUser(resp.data)
       else setUser(null)
     } catch (e) {
       setUser(null)
     }
   }

   const logout = () => {
     setUser(null)
     ;(async () => {
       try {
         await axios.post('/api/auth/logout')
       } catch (e) {
         // ignore
       }
     })()
   }

   const value: AuthContextType = {
     user,
     isAuthenticated: !!user,
     login,
     logout,
     refreshUserFromServer
   }

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
 }
