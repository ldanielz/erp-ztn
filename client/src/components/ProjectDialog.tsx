import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box
} from '@mui/material'
import api from '../api/axios'

interface Client {
    id: number
    name: string
}

interface Project {
    id?: number
    name: string
    client_id: number | ''
    status: string
    start_date: string
    end_date: string
}

interface ProjectDialogProps {
    open: boolean
    onClose: () => void
    onSave: (project: Partial<Project>) => Promise<void>
    project?: Project | null
}

export default function ProjectDialog({ open, onClose, onSave, project }: ProjectDialogProps): JSX.Element {
    const [formData, setFormData] = useState<Project>({
        name: '',
        client_id: '',
        status: 'planning',
        start_date: '',
        end_date: ''
    })
    const [clients, setClients] = useState<Client[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await api.get('/clients')
                setClients(res.data)
            } catch (err) {
                console.error('Failed to fetch clients', err)
            }
        }
        if (open) {
            fetchClients()
        }
    }, [open])

    useEffect(() => {
        if (project) {
            setFormData({
                ...project,
                start_date: project.start_date ? project.start_date.split('T')[0] : '',
                end_date: project.end_date ? project.end_date.split('T')[0] : ''
            })
        } else {
            setFormData({
                name: '',
                client_id: '',
                status: 'planning',
                start_date: '',
                end_date: ''
            })
        }
    }, [project, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const projectToSave = {
                ...formData,
                client_id: formData.client_id === '' ? 0 : Number(formData.client_id)
            }
            await onSave(projectToSave as any)
            onClose()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>{project ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Nome do Projeto"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            fullWidth
                        />
                        <FormControl fullWidth required>
                            <InputLabel>Cliente</InputLabel>
                            <Select
                                value={formData.client_id}
                                label="Cliente"
                                onChange={(e) => setFormData({ ...formData, client_id: Number(e.target.value) })}
                            >
                                {clients.map((client) => (
                                    <MenuItem key={client.id} value={client.id}>
                                        {client.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Data de Início"
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Data de Término"
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status}
                                label="Status"
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <MenuItem value="planning">Planejamento</MenuItem>
                                <MenuItem value="in_progress">Em Andamento</MenuItem>
                                <MenuItem value="on_hold">Em Espera</MenuItem>
                                <MenuItem value="completed">Concluído</MenuItem>
                                <MenuItem value="cancelled">Cancelado</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cancelar</Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
