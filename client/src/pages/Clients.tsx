import React from 'react'
import { Box, Typography } from '@mui/material'
import { materialYouPalette } from '../assets/js/materialYou'

export default function Clients(): JSX.Element {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ color: materialYouPalette.primary.primary, fontWeight: 700 }}>
                Clientes
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
                Módulo de Gestão de Clientes em construção.
            </Typography>
        </Box>
    )
}
