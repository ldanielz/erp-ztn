import React from 'react'
import { Container, Typography, Box } from '@mui/material'

export default function Dashboard(): JSX.Element {
  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Typography sx={{ mt: 2 }}>Área protegida — bem-vindo(a)!</Typography>
      </Box>
    </Container>
  )
}
