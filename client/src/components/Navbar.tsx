import React from 'react'
import { Box, Button, Toolbar, AppBar, Container } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../context/AuthProvider'
import UserSettingsMenu from './UserSettingsMenu'
import NotificationsCenter from './NotificationsCenter'

export default function Navbar(): JSX.Element {
  const auth = useAuth()

  return (
    <AppBar position="static" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Brand/Logo */}
          <Box sx={{ display: 'flex', gap: 2, flexGrow: 1 }}>
            <Button component={RouterLink} to="/" variant="text" sx={{ color: 'inherit', fontWeight: 700 }}>
              ERP ZTN
            </Button>
            {!auth.isAuthenticated && (
              <>
                <Button component={RouterLink} to="/" variant="text" sx={{ color: 'inherit' }}>
                  Home
                </Button>
                <Button component={RouterLink} to="/about" variant="text" sx={{ color: 'inherit' }}>
                  Sobre
                </Button>
                <Button component={RouterLink} to="/contact" variant="text" sx={{ color: 'inherit' }}>
                  Contato
                </Button>
              </>
            )}
          </Box>

          {/* Authenticated Menu */}
          {auth.isAuthenticated ? (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button component={RouterLink} to="/dashboard" variant="text" sx={{ color: 'inherit' }}>
                Dashboard
              </Button>
              {auth.user?.role === 'admin' && (
                <Button component={RouterLink} to="/admin" variant="text" sx={{ color: 'inherit' }}>
                  Admin
                </Button>
              )}
              <Button component={RouterLink} to="/clients" variant="text" sx={{ color: 'inherit' }}>
                Clientes
              </Button>
              <Button component={RouterLink} to="/erbs" variant="text" sx={{ color: 'inherit' }}>
                ERBs
              </Button>
              <Button component={RouterLink} to="/projects" variant="text" sx={{ color: 'inherit' }}>
                Projetos
              </Button>

              {/* Notifications */}
              <NotificationsCenter />

              {/* User Settings */}
              <UserSettingsMenu />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={RouterLink} to="/login" variant="text" sx={{ color: 'inherit' }}>
                Login
              </Button>
              <Button component={RouterLink} to="/register" variant="contained" color="secondary">
                Registrar
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  )
}
