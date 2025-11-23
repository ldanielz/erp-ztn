import React from 'react'
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, useTheme } from '@mui/material'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    CellTower as CellTowerIcon,
    Assignment as AssignmentIcon,
    AdminPanelSettings as AdminPanelSettingsIcon,
    Person as PersonIcon
} from '@mui/icons-material'
import { useAuth } from '../context/AuthProvider'

const DRAWER_WIDTH = 280

interface SidebarProps {
    open: boolean
    onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps): JSX.Element {
    const auth = useAuth()
    const location = useLocation()
    const theme = useTheme()

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Clientes', icon: <PeopleIcon />, path: '/clients' },
        { text: 'ERBs', icon: <CellTowerIcon />, path: '/erbs' },
        { text: 'Projetos', icon: <AssignmentIcon />, path: '/projects' },
        { text: 'Meu Perfil', icon: <PersonIcon />, path: '/profile' }
    ]

    if (auth.user?.role === 'admin') {
        menuItems.push({ text: 'Admin', icon: <AdminPanelSettingsIcon />, path: '/admin' })
    }

    const renderContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ px: 2.5, py: 3, display: 'inline-flex' }}>
                {/* Logo placeholder */}
                <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 'bold' }}>ZTN</Typography>
            </Box>

            <Box sx={{ mb: 5, mx: 2.5 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        borderRadius: 1.5,
                        backgroundColor: 'rgba(145, 158, 171, 0.12)'
                    }}
                >
                    <Avatar src="" alt={auth.user?.name} sx={{ width: 40, height: 40 }} />
                    <Box sx={{ ml: 2 }}>
                        <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                            {auth.user?.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {auth.user?.role}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <List disablePadding sx={{ p: 1 }}>
                {menuItems.map((item) => {
                    const active = location.pathname.startsWith(item.path)
                    return (
                        <ListItemButton
                            key={item.text}
                            component={RouterLink}
                            to={item.path}
                            onClick={onClose} // Close drawer on mobile when item clicked
                            sx={{
                                height: 48,
                                position: 'relative',
                                textTransform: 'capitalize',
                                color: 'text.secondary',
                                borderRadius: 1,
                                ...(active && {
                                    color: 'primary.main',
                                    fontWeight: 'fontWeightBold',
                                    bgcolor: 'action.selected',
                                    '&:before': {
                                        top: 0,
                                        right: 0,
                                        width: 3,
                                        bottom: 0,
                                        content: "''",
                                        display: 'block',
                                        position: 'absolute',
                                        borderTopLeftRadius: 4,
                                        borderBottomLeftRadius: 4,
                                        backgroundColor: 'primary.main'
                                    }
                                })
                            }}
                        >
                            <ListItemIcon sx={{ color: active ? 'primary.main' : 'inherit', minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} primaryTypographyProps={{ variant: 'body2', fontWeight: active ? 'bold' : 'medium' }} />
                        </ListItemButton>
                    )
                })}
            </List>
        </Box>
    )

    return (
        <Box component="nav" sx={{ flexShrink: { lg: 0 }, width: { lg: DRAWER_WIDTH } }}>
            {/* Mobile Drawer */}
            <Drawer
                open={open}
                onClose={onClose}
                variant="temporary"
                PaperProps={{
                    sx: {
                        width: DRAWER_WIDTH,
                        bgcolor: 'background.default',
                        borderRightStyle: 'dashed'
                    }
                }}
                ModalProps={{ keepMounted: true }}
                sx={{ display: { xs: 'block', lg: 'none' } }}
            >
                {renderContent}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                open
                variant="permanent"
                PaperProps={{
                    sx: {
                        width: DRAWER_WIDTH,
                        bgcolor: 'background.default',
                        borderRightStyle: 'dashed'
                    }
                }}
                sx={{ display: { xs: 'none', lg: 'block' } }}
            >
                {renderContent}
            </Drawer>
        </Box>
    )
}
