import React from 'react'
import { AppBar, Toolbar, Typography, Box } from '@mui/material'

export default function Header(): JSX.Element {
  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6">ERP ZTN</Typography>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
