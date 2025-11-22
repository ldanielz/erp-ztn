import React from 'react'
import { Box, Button } from '@mui/material'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'

export default function Navbar(): JSX.Element {
  const auth = useAuth()
  const navigate = useNavigate()

  return (
    <Box component="nav" sx={{ display: 'flex', gap: 1, p: 1, alignItems: 'center' }}>
      <Button component={RouterLink} to="/" variant="text">
        Home
      </Button>
      <Button component={RouterLink} to="/about" variant="text">
        About
      </Button>
      <Button component={RouterLink} to="/contact" variant="text">
        Contact
      </Button>
      {auth.isAuthenticated ? (
        <>
          <Button component={RouterLink} to="/dashboard" variant="text">
            Dashboard
          </Button>
          {auth.user?.role === 'admin' && (
            <Button component={RouterLink} to="/admin" variant="text" color="inherit">
              Admin
            </Button>
          )}
          <Button component={RouterLink} to="/clients" variant="text">
            Clientes
          </Button>
          <Button component={RouterLink} to="/erbs" variant="text">
            ERBs
          </Button>
          <Button component={RouterLink} to="/projects" variant="text">
            Projetos
          </Button>
          <Button component={RouterLink} to="/profile" variant="text">
            Meu Perfil
          </Button>
          <Box sx={{ mx: 1 }}>
            <strong>{auth.user?.name || auth.user?.email || 'Usuário'}</strong>
          </Box>
          <Button onClick={() => { auth.logout(); navigate('/'); }} variant="contained">
            Logout
          </Button>
        </>
      ) : (
        <>
          <Button component={RouterLink} to="/login" variant="text">
            Login
          </Button>
          <Button component={RouterLink} to="/register" variant="contained">
            Register
          </Button>
        </>
      )}
    </Box>
  )
}
