import React from 'react'
import { Container, Box, TextField, Button, Typography, Alert } from '@mui/material'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import axios from '../api/axios'
import { useAuth } from '../context/AuthProvider'
import { useNavigate } from 'react-router-dom'

type FormData = {
  email: string
  password: string
}

const schema = yup.object({
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup.string().min(6, 'Senha muito curta').required('Senha é obrigatória')
})

export default function Login(): JSX.Element {
  const { login, refreshUserFromServer } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({ resolver: yupResolver(schema) })
  const [serverError, setServerError] = React.useState<string | null>(null)

  const onSubmit = async (data: FormData) => {
    setServerError(null)
    try {
      const resp = await axios.post('/api/auth/login', data)
      const token = resp.data?.token
      // server sets httpOnly cookie; attempt to update client state
      await login(token)
      // ensure authoritative user state
      await refreshUserFromServer?.()
      navigate('/')
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Erro ao autenticar')
    }
  }

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h5" component="h1" align="center">
          Entrar
        </Typography>
        {serverError && <Alert severity="error">{serverError}</Alert>}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Email" type="email" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
          <TextField label="Senha" type="password" {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
          <Button variant="contained" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </Button>
        </Box>
      </Box>
    </Container>
  )
}
