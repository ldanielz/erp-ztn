import React, { useEffect, useState } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Avatar,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack
} from '@mui/material'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import PersonIcon from '@mui/icons-material/Person'
import AssessmentIcon from '@mui/icons-material/Assessment'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useAuth } from '../context/AuthProvider'
import axios from '../api/axios'
import { materialYouPalette, getChartColors } from '../assets/js/materialYou'

const StatCard = ({ title, value, icon }: { title: string; value: string | number; icon?: React.ReactNode }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      background: `linear-gradient(135deg, ${materialYouPalette.primary.primaryContainer} 0%, ${materialYouPalette.secondary.secondaryContainer} 100%)`,
      border: `1px solid ${materialYouPalette.neutral.outlineVariant}`,
      transition: 'all 0.3s ease',
      '&:hover': { elevation: 8, transform: 'translateY(-4px)' }
    }}
  >
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{
            bgcolor: materialYouPalette.primary.primary,
            width: 48,
            height: 48
          }}
        >
          {icon}
        </Avatar>
        <Box>
          <Typography variant="caption" sx={{ color: materialYouPalette.neutral.onSurfaceVariant, fontWeight: 500 }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: materialYouPalette.primary.primary }}>
            {value}
          </Typography>
        </Box>
      </Box>
    </CardContent>
  </Card>
)

const ChartCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Card
    elevation={0}
    sx={{
      borderRadius: 3,
      border: `1px solid ${materialYouPalette.neutral.outlineVariant}`,
      bgcolor: materialYouPalette.neutral.surface
    }}
  >
    <CardContent>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: materialYouPalette.primary.primary }}>
        {title}
      </Typography>
      {children}
    </CardContent>
  </Card>
)

import AdminUsersDialog from '../components/admin/AdminUsersDialog'
import AdminLogsDialog from '../components/admin/AdminLogsDialog'
import AdminSettingsDialog from '../components/admin/AdminSettingsDialog'

// ... existing imports ...

export default function AdminDashboard(): JSX.Element {
  const { user } = useAuth()

  const [stats, setStats] = useState<{ title: string; value: number; icon?: React.ReactNode }[]>([])
  const [recent, setRecent] = useState<Array<{ id: number; email?: string; name?: string; text?: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<any[]>([])

  // Create User Modal State
  const [openModal, setOpenModal] = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)
  const [modalSuccess, setModalSuccess] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })

  // Quick Actions State
  const [openUsersDialog, setOpenUsersDialog] = useState(false)
  const [openLogsDialog, setOpenLogsDialog] = useState(false)
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false)

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          setLoading(true)
          const resp = await axios.get('/admin/stats')
          if (!mounted) return
          const s = resp.data

          // Generate demo chart data based on users
          const demoData = Array.from({ length: 7 }, (_, i) => ({
            day: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom'][i],
            users: Math.floor(Math.random() * 50) + 10,
            activity: Math.floor(Math.random() * 30) + 5
          }))
          setChartData(demoData)

          setStats([
            { title: 'Usuários', value: s.usersCount, icon: <PersonIcon /> },
            { title: 'Atividades (hoje)', value: s.recentActivities?.length || 0, icon: <AssessmentIcon /> },
            {
              title: 'Admins',
              value: s.recentUsers?.filter((u: any) => u.role === 'admin').length || 0,
              icon: <AdminPanelSettingsIcon />
            }
          ])
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

  const chartColors = getChartColors()

  const handleOpenModal = () => {
    setOpenModal(true)
    setModalError(null)
    setModalSuccess(false)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
    setFormData({ name: '', email: '', password: '' })
    setModalError(null)
    setModalSuccess(false)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCreateUser = async () => {
    setModalError(null)
    setModalSuccess(false)

    // Validate form
    if (!formData.name || !formData.email || !formData.password) {
      setModalError('Nome, email e senha são obrigatórios')
      return
    }

    try {
      setModalLoading(true)
      const resp = await axios.post('/admin/users', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      })

      setModalSuccess(true)
      setFormData({ name: '', email: '', password: '' })

      // Refresh stats after successful user creation
      setTimeout(() => {
        const refreshStats = async () => {
          try {
            const statsResp = await axios.get('/admin/stats')
            const s = statsResp.data
            setStats([
              { title: 'Usuários', value: s.usersCount, icon: <PersonIcon /> },
              { title: 'Atividades (hoje)', value: s.recentActivities?.length || 0, icon: <AssessmentIcon /> },
              {
                title: 'Admins',
                value: s.recentUsers?.filter((u: any) => u.role === 'admin').length || 0,
                icon: <AdminPanelSettingsIcon />
              }
            ])
            setRecent((s.recentUsers || []).map((u: any) => ({ id: u.id, email: u.email, name: u.name })))
          } catch (e) {
            // silently fail on refresh
          }
        }
        refreshStats()
      }, 500)

      // Close modal after showing success
      setTimeout(() => {
        handleCloseModal()
      }, 1500)
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || 'Erro ao criar usuário'
      setModalError(errorMsg)
    } finally {
      setModalLoading(false)
    }
  }

  return (
    <Box
      sx={{
        p: 3,
        background: `linear-gradient(135deg, ${materialYouPalette.neutral.background} 0%, ${materialYouPalette.primary.primaryContainer}10 100%)`,
        minHeight: '100vh'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: materialYouPalette.primary.primary,
              mb: 0.5
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: materialYouPalette.neutral.onSurfaceVariant }}>
            Bem vindo, {user?.name || user?.email}
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            onClick={handleOpenModal}
            sx={{
              bgcolor: materialYouPalette.primary.primary,
              '&:hover': { bgcolor: materialYouPalette.primary.onPrimaryContainer }
            }}
          >
            Criar Usuário
          </Button>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />}

      {!loading && !error && (
        <Grid container spacing={2}>
          {stats.map((s) => (
            <Grid key={s.title} item xs={12} sm={4}>
              <StatCard title={s.title} value={s.value} icon={s.icon} />
            </Grid>
          ))}

          <Grid item xs={12} md={8}>
            <ChartCard title="Crescimento de Usuários (7 dias)">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors.primary} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={chartColors.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={materialYouPalette.neutral.outlineVariant} />
                  <XAxis dataKey="day" stroke={materialYouPalette.neutral.onSurfaceVariant} />
                  <YAxis stroke={materialYouPalette.neutral.onSurfaceVariant} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: materialYouPalette.neutral.surface,
                      border: `1px solid ${materialYouPalette.neutral.outlineVariant}`,
                      borderRadius: '8px'
                    } as React.CSSProperties}
                  />
                  <Area type="monotone" dataKey="users" stroke={chartColors.primary} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <ChartCard title="Ações Rápidas">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="outlined" onClick={() => setOpenUsersDialog(true)}>Gerenciar Usuários</Button>
                <Button variant="outlined" onClick={() => setOpenLogsDialog(true)}>Ver Logs</Button>
                <Button variant="outlined" onClick={() => setOpenSettingsDialog(true)}>Configurações</Button>
              </Box>
            </ChartCard>
          </Grid>

          <Grid item xs={12}>
            <ChartCard title="Atividade por Tipo (7 dias)">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={materialYouPalette.neutral.outlineVariant} />
                  <XAxis dataKey="day" stroke={materialYouPalette.neutral.onSurfaceVariant} />
                  <YAxis stroke={materialYouPalette.neutral.onSurfaceVariant} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: materialYouPalette.neutral.surface,
                      border: `1px solid ${materialYouPalette.neutral.outlineVariant}`,
                      borderRadius: '8px'
                    } as React.CSSProperties}
                  />
                  <Legend />
                  <Bar dataKey="users" fill={chartColors.primary} radius={[8, 8, 0, 0]} />
                  <Bar dataKey="activity" fill={chartColors.secondary} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>

          <Grid item xs={12}>
            <ChartCard title="Usuários Recentes">
              <List>
                {recent.length > 0 ? (
                  recent.map((r) => (
                    <ListItem
                      key={r.id}
                      divider
                      sx={{
                        borderColor: materialYouPalette.neutral.outlineVariant,
                        '&:hover': { bgcolor: materialYouPalette.neutral.background }
                      }}
                    >
                      <Avatar sx={{ mr: 2, bgcolor: chartColors.primary }}>{r.name?.substring(0, 1)}</Avatar>
                      <ListItemText
                        primary={r.name || 'Usuário'}
                        secondary={r.email}
                        primaryTypographyProps={{ fontWeight: 600, color: materialYouPalette.primary.primary }}
                      />
                      <Chip label="Ativo" color="success" variant="outlined" size="small" />
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <Typography variant="body2" color="textSecondary">
                      Nenhum usuário ainda
                    </Typography>
                  </ListItem>
                )}
              </List>
            </ChartCard>
          </Grid>
        </Grid>
      )}

      {/* Create User Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: materialYouPalette.primary.primary }}>
          Criar Novo Usuário
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {modalSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Usuário criado com sucesso!
            </Alert>
          )}
          {modalError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {modalError}
            </Alert>
          )}
          <Stack spacing={2}>
            <TextField
              label="Nome"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              fullWidth
              disabled={modalLoading || modalSuccess}
              variant="outlined"
              placeholder="Ex: João Silva"
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              fullWidth
              disabled={modalLoading || modalSuccess}
              variant="outlined"
              placeholder="Ex: joao@example.com"
            />
            <TextField
              label="Senha"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleFormChange}
              fullWidth
              disabled={modalLoading || modalSuccess}
              variant="outlined"
              placeholder="Senha segura"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseModal}
            disabled={modalLoading}
            sx={{ color: materialYouPalette.neutral.onSurface }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreateUser}
            variant="contained"
            disabled={modalLoading || modalSuccess}
            sx={{
              bgcolor: materialYouPalette.primary.primary,
              '&:hover': { bgcolor: materialYouPalette.primary.onPrimaryContainer }
            }}
          >
            {modalLoading ? <CircularProgress size={24} /> : 'Criar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Quick Action Dialogs */}
      <AdminUsersDialog open={openUsersDialog} onClose={() => setOpenUsersDialog(false)} />
      <AdminLogsDialog open={openLogsDialog} onClose={() => setOpenLogsDialog(false)} />
      <AdminSettingsDialog open={openSettingsDialog} onClose={() => setOpenSettingsDialog(false)} />
    </Box>
  )
}
