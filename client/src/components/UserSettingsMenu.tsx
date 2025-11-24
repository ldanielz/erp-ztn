import React, { useState } from 'react'
import {
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Box,
  Typography
} from '@mui/material'
import {
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Logout as LogoutIcon
} from '@mui/icons-material'
import { useAuth } from '../context/AuthProvider'
import { useTheme } from '../context/ThemeProvider'
import { useNavigate } from 'react-router-dom'
import UserProfileDialog from './UserProfileDialog'

export default function UserSettingsMenu(): JSX.Element {
  const auth = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)

  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleProfile = () => {
    setProfileDialogOpen(true)
    handleClose()
  }

  const handleLogout = () => {
    auth.logout()
    navigate('/')
    handleClose()
  }

  const getInitials = () => {
    const name = auth.user?.name || auth.user?.email || 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
          {getInitials()}
        </Avatar>
      </IconButton>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {auth.user?.name || auth.user?.email}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {auth.user?.role === 'admin' ? 'Administrador' : 'Usuário'}
          </Typography>
        </Box>
        <Divider />

        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <AccountIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Meu Perfil</ListItemText>
        </MenuItem>

        <MenuItem onClick={toggleTheme}>
          <ListItemIcon>
            {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>
            {isDark ? 'Modo Claro' : 'Modo Escuro'}
          </ListItemText>
        </MenuItem>

        <MenuItem>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Configurações</ListItemText>
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Sair</ListItemText>
        </MenuItem>
      </Menu>

      <UserProfileDialog open={profileDialogOpen} onClose={() => setProfileDialogOpen(false)} />
    </>
  )
}
