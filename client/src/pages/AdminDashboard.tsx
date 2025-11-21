import React from 'react'
import { Box, Grid, Card, CardContent, Typography, Button, List, ListItem, ListItemText, Avatar } from '@mui/material'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import PersonIcon from '@mui/icons-material/Person'
import AssessmentIcon from '@mui/icons-material/Assessment'
import { useAuth } from '../context/AuthProvider'
import { useEffect, useState } from 'react'
import axios from '../api/axios'

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

  const [stats, setStats] = useState<{ title: string; value: number; icon?: React.ReactNode }[]>([])
  const [recent, setRecent] = useState<Array<{ id: number; email?: string; name?: string; text?: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const resp = await axios.get('/api/admin/stats')
        if (!mounted) return
        const s = resp.data
        setStats([
          { title: 'Usuários', value: s.usersCount, icon: <PersonIcon /> },
          { title: 'Atividades (hoje)', value: s.recentActivities?.length || 0, icon: <AssessmentIcon /> },
          { title: 'Admins', value: s.recentUsers?.filter((u: any) => u.role === 'admin').length || 0, icon: <AdminPanelSettingsIcon /> }
        ])
        // map recent users to text
        setRecent((s.recentUsers || []).map((u: any) => ({ id: u.id, email: u.email, name: u.name })))
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Erro ao carregar dashboard')
      } finally {
        setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

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
