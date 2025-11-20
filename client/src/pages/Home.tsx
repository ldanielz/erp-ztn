import React from 'react'
import { Container, Typography, Box } from '@mui/material'

export default function Home(): JSX.Element {
  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4">Home</Typography>
        <Typography sx={{ mt: 2 }}>Bem-vindo ao ERP ZTN.</Typography>
      </Box>
    </Container>
  )
}
