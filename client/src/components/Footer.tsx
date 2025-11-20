import React from 'react'
import { Box, Typography } from '@mui/material'

export default function Footer(): JSX.Element {
  return (
    <Box component="footer" sx={{ py: 2, textAlign: 'center', mt: 'auto', bgcolor: 'background.paper' }}>
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} ERP ZTN
      </Typography>
    </Box>
  )
}
