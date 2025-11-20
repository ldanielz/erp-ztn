import React, { useState } from 'react'
import {
  Container,
  Box,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Avatar,
  Divider
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import axios from '../api/axios'
import { useAuth } from '../context/AuthProvider'

type FormData = {
  name: string
  email: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

const schema = yup.object({
  name: yup.string().min(2, 'Nome muito curto').required('Nome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  currentPassword: yup.string().optional(),
  newPassword: yup.string().min(6, 'Senha muito curta').optional(),
  confirmPassword: yup
    .string()
    .optional()
    .oneOf([yup.ref('newPassword')], 'Senhas não conferem')
})

export default function UserProfile(): JSX.Element {
  const { user, refreshUserFromServer } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || ''
    }
  })

  const onSubmit = async (data: FormData) => {
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsLoading(true)

    try {
      const payload: any = {
        name: data.name,
        email: data.email
      }

      // Only include password fields if user is changing password
      if (data.currentPassword && data.newPassword) {
        payload.currentPassword = data.currentPassword
        payload.newPassword = data.newPassword
      }

      const resp = await axios.patch('/api/auth/update-profile', payload)

      if (resp.data) {
        setSuccessMessage('Perfil atualizado com sucesso!')
        // Refresh user from server to sync UI
        await refreshUserFromServer?.()
        setIsEditing(false)
        // Reset form with fresh data from server
        reset({
          name: user?.name || '',
          email: user?.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao atualizar perfil'
      setErrorMessage(msg)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" color="error">
            Usuário não autenticado
          </Typography>
        </Box>
      </Container>
    )
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) return name.substring(0, 2).toUpperCase()
    if (email) return email.substring(0, 2).toUpperCase()
    return 'U'
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Card>
          <CardHeader
            title="Meu Perfil"
            subheader={isEditing ? 'Editar informações' : 'Informações da conta'}
            titleTypographyProps={{ variant: 'h5' }}
          />

          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Avatar Section */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: '2rem',
                  bgcolor: 'primary.main'
                }}
              >
                {getInitials(user.name, user.email)}
              </Avatar>
            </Box>

            {/* Success/Error Messages */}
            {successMessage && <Alert severity="success">{successMessage}</Alert>}
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            <Divider />

            {/* Display Mode */}
            {!isEditing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Nome
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {user.name || 'Não informado'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="textSecondary">
                    Email
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {user.email}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="textSecondary">
                    ID de Usuário
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {user.sub || 'N/A'}
                  </Typography>
                </Box>

                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => setIsEditing(true)}
                    fullWidth
                  >
                    Editar Perfil
                  </Button>
                </Box>
              </Box>
            ) : (
              /* Edit Mode */
              <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Nome"
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  fullWidth
                />

                <TextField
                  label="Email"
                  type="email"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  fullWidth
                />

                <Divider />

                <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
                  Alterar Senha (Opcional)
                </Typography>

                <TextField
                  label="Senha Atual"
                  type="password"
                  {...register('currentPassword')}
                  error={!!errors.currentPassword}
                  helperText={errors.currentPassword?.message || 'Deixe em branco para não alterar'}
                  fullWidth
                />

                <TextField
                  label="Nova Senha"
                  type="password"
                  {...register('newPassword')}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword?.message}
                  fullWidth
                  disabled={!register('currentPassword').value}
                />

                <TextField
                  label="Confirmar Nova Senha"
                  type="password"
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  fullWidth
                  disabled={!register('newPassword').value}
                />

                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    fullWidth
                  >
                    {isSubmitting || isLoading ? <CircularProgress size={24} /> : 'Salvar Alterações'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsEditing(false)
                      setErrorMessage(null)
                      setSuccessMessage(null)
                      reset({
                        name: user.name || '',
                        email: user.email || '',
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      })
                    }}
                    fullWidth
                  >
                    Cancelar
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Account Info Card */}
        <Card sx={{ mt: 3 }}>
          <CardHeader title="Informações da Conta" />
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  Status
                </Typography>
                <Typography variant="body2" sx={{ color: 'green', fontWeight: 600 }}>
                  ✓ Ativo
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="textSecondary">
                  Autenticação
                </Typography>
                <Typography variant="body2">
                  Cookie httpOnly (Seguro)
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  )
}
