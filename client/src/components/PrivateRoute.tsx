import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const auth = useAuth()
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}
