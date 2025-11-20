import React from 'react'
import { Container, Typography, Box } from '@mui/material'

export default function Contact(): JSX.Element {
  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4">Contact</Typography>
        <Typography sx={{ mt: 2 }}>Contato e suporte.</Typography>
      </Box>
    </Container>
  )
}
