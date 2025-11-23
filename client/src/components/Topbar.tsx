import React from 'react'
import { Box, AppBar, Toolbar, IconButton, Typography, Avatar, Stack, Button } from '@mui/material'
import { Menu as MenuIcon, ExitToApp as ExitToAppIcon } from '@mui/icons-material'
import { useAuth } from '../context/AuthProvider'
import { useNavigate } from 'react-router-dom'

const DRAWER_WIDTH = 280
const APPBAR_MOBILE = 64
const APPBAR_DESKTOP = 92

interface TopbarProps {
    onOpenSidebar: () => void
}

export default function Topbar({ onOpenSidebar }: TopbarProps): JSX.Element {
    const auth = useAuth()
    const navigate = useNavigate()

    return (
        <AppBar
            sx={{
                boxShadow: 'none',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)', // Fix on Mobile
                backgroundColor: (theme) => `rgba(${theme.palette.background.default}, 0.72)`,
                width: { lg: `calc(100% - ${DRAWER_WIDTH}px)` }
            }}
        >
            <Toolbar sx={{ minHeight: { xs: APPBAR_MOBILE, lg: APPBAR_DESKTOP }, px: { lg: 5 } }}>
                <IconButton
                    onClick={onOpenSidebar}
                    sx={{ mr: 1, color: 'text.primary', display: { lg: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>

                <Box sx={{ flexGrow: 1 }} />

                <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: 'text.primary', display: { xs: 'none', sm: 'block' } }}>
                            {auth.user?.name}
                        </Typography>
                        <Avatar
                            src=""
                            alt={auth.user?.name}
                            sx={{ width: 40, height: 40, cursor: 'pointer' }}
                        />
                    </Box>
                    <IconButton
                        onClick={() => { auth.logout(); navigate('/'); }}
                        sx={{ color: 'text.secondary' }}
                        title="Logout"
                    >
                        <ExitToAppIcon />
                    </IconButton>
                </Stack>
            </Toolbar>
        </AppBar>
    )
}
