import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const APPBAR_MOBILE = 64
const APPBAR_DESKTOP = 92

export default function Layout(): JSX.Element {
    const [open, setOpen] = useState(false)

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
            <Topbar onOpenSidebar={() => setOpen(true)} />
            <Sidebar open={open} onClose={() => setOpen(false)} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    minHeight: '100%',
                    pt: { xs: `${APPBAR_MOBILE + 24}px`, lg: `${APPBAR_DESKTOP + 24}px` },
                    pb: 10,
                    px: 2
                }}
            >
                <Outlet />
            </Box>
        </Box>
    )
}
