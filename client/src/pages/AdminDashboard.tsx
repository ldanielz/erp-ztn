import React from 'react'
import { Box, Grid, Card, CardContent, Typography, Button, List, ListItem, ListItemText, Avatar } from '@mui/material'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import PersonIcon from '@mui/icons-material/Person'
import AssessmentIcon from '@mui/icons-material/Assessment'
import { useAuth } from '../context/AuthProvider'

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon?: React.ReactNode }) => (
  <Card elevation={4} sx={{ borderRadius: 3 }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>{icon}</Avatar>
        <Box>
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
)

export default function AdminDashboard(): JSX.Element {
  const { user } = useAuth()

  // demo data - replace with real API calls when available
  const stats = [
    { title: 'Usuários', value: 128, icon: <PersonIcon /> },
    { title: 'Atividades (hoje)', value: 54, icon: <AssessmentIcon /> },
    { title: 'Admins', value: 3, icon: <AdminPanelSettingsIcon /> }
  ]

  const recent = [
    { id: 1, text: 'Usuário maria@example.com entrou no sistema' },
    { id: 2, text: 'Usuário joao@example.com atualizou o perfil' },
    { id: 3, text: 'Nova conta criada: pedro@example.com' }
  ]

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Admin Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bem vindo, {user?.name || user?.email}
          </Typography>
        </Box>
        <Box>
          <Button variant="contained">Criar Usuário</Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {stats.map((s) => (
          <Grid key={s.title} item xs={12} sm={4}>
            <StatCard title={s.title} value={s.value} icon={s.icon} />
          </Grid>
        ))}

        <Grid item xs={12} md={8}>
          <Card elevation={4} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Usuários Recentes
              </Typography>
              <List>
                {recent.map((r) => (
                  <ListItem key={r.id} divider>
                    <ListItemText primary={r.text} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={4} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Ações Rápidas
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="outlined">Gerenciar Usuários</Button>
                <Button variant="outlined">Ver Logs</Button>
                <Button variant="outlined">Configurações</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
