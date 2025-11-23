import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    CircularProgress,
    Alert,
    Stack,
    Switch,
    FormControlLabel
} from '@mui/material'
import axios from '../../api/axios'
import { materialYouPalette } from '../../assets/js/materialYou'

interface AdminSettingsDialogProps {
    open: boolean
    onClose: () => void
}

export default function AdminSettingsDialog({ open, onClose }: AdminSettingsDialogProps) {
    const [settings, setSettings] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (open) {
            fetchSettings()
        }
    }, [open])

    const fetchSettings = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await axios.get('/admin/settings')
            setSettings(response.data)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao carregar configurações')
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            setError(null)
            setSuccess(false)
            await axios.put('/admin/settings', settings)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao salvar configurações')
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (key: string, value: string) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, color: materialYouPalette.primary.primary }}>
                Configurações do Sistema
            </DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>Configurações salvas com sucesso!</Alert>}

                {loading ? (
                    <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />
                ) : (
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="Nome do Site"
                            value={settings.site_name || ''}
                            onChange={(e) => handleChange('site_name', e.target.value)}
                            fullWidth
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.maintenance_mode === 'true'}
                                    onChange={(e) => handleChange('maintenance_mode', String(e.target.checked))}
                                />
                            }
                            label="Modo Manutenção"
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={settings.allow_registration === 'true'}
                                    onChange={(e) => handleChange('allow_registration', String(e.target.checked))}
                                />
                            }
                            label="Permitir Novos Cadastros"
                        />
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Fechar</Button>
                <Button
                    onClick={handleSave}
                    variant="contained"
                    disabled={loading || saving}
                    sx={{ bgcolor: materialYouPalette.primary.primary }}
                >
                    {saving ? <CircularProgress size={24} color="inherit" /> : 'Salvar'}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
