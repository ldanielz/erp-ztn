import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress
} from '@mui/material'
import { useAuth } from '../context/AuthProvider'
import api from '../api/axios'

interface Props {
  open: boolean
  onClose: () => void
}

export default function UserProfileDialog({ open, onClose }: Props): JSX.Element {
  const auth = useAuth()
  const [name, setName] = useState(auth.user?.name || '')
  const [email, setEmail] = useState(auth.user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSaveProfile = async () => {
    setLoading(true)
    setMessage(null)
    try {
      await api.put('/auth/profile', { name, email })
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
      await auth.refreshUserFromServer?.()
      setTimeout(onClose, 1500)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao atualizar perfil' })
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Senhas não coincidem' })
      return
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Senha deve ter pelo menos 6 caracteres' })
      return
    }

    setLoading(true)
    setMessage(null)
    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      })
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(onClose, 1500)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Erro ao alterar senha' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Meu Perfil</DialogTitle>
      <DialogContent dividers>
        {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Profile Info Section */}
          <Box>
            <TextField
              label="Nome"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              margin="normal"
            />
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              margin="normal"
            />
            <Button
              variant="contained"
              fullWidth
              onClick={handleSaveProfile}
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Salvar Perfil'}
            </Button>
          </Box>

          {/* Change Password Section */}
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
            <TextField
              label="Senha Atual"
              fullWidth
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={loading}
              margin="normal"
            />
            <TextField
              label="Nova Senha"
              fullWidth
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading}
              margin="normal"
            />
            <TextField
              label="Confirmar Senha"
              fullWidth
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              margin="normal"
            />
            <Button
              variant="outlined"
              fullWidth
              onClick={handleChangePassword}
              disabled={loading || !currentPassword || !newPassword}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Alterar Senha'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  )
}
