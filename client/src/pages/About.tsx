import React from 'react'
import { Container, Typography, Box } from '@mui/material'

export default function About(): JSX.Element {
  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4">About</Typography>
        <Typography sx={{ mt: 2 }}>Informações sobre o sistema ERP ZTN.</Typography>
      </Box>
    </Container>
  )
}
