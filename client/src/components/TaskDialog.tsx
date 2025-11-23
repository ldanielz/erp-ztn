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

interface User {
    id: number
    name: string
    email: string
}

interface Task {
    id?: number
    title: string
    description: string
    status: string
    assignee_id: number | ''
}

interface TaskDialogProps {
    open: boolean
    onClose: () => void
    onSave: (task: Task) => Promise<void>
    task?: Task | null
}

export default function TaskDialog({ open, onClose, onSave, task }: TaskDialogProps): JSX.Element {
    const [formData, setFormData] = useState<Task>({
        title: '',
        description: '',
        status: 'todo',
        assignee_id: ''
    })
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Using admin endpoint for now as per plan, assuming admin user or accessible route
                // If this fails for non-admins, we might need a public 'users' endpoint
                const res = await api.get('/admin/users')
                setUsers(res.data)
            } catch (err) {
                console.error('Failed to fetch users', err)
            }
        }
        if (open) {
            fetchUsers()
        }
    }, [open])

    useEffect(() => {
        if (task) {
            setFormData(task)
        } else {
            setFormData({
                title: '',
                description: '',
                status: 'todo',
                assignee_id: ''
            })
        }
    }, [task, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const taskToSave = {
                ...formData,
                assignee_id: formData.assignee_id === '' ? null : Number(formData.assignee_id)
            }
            await onSave(taskToSave as any)
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
                <DialogTitle>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Título"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Descrição"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            multiline
                            rows={3}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Responsável</InputLabel>
                            <Select
                                value={formData.assignee_id}
                                label="Responsável"
                                onChange={(e) => setFormData({ ...formData, assignee_id: Number(e.target.value) })}
                            >
                                <MenuItem value=""><em>Nenhum</em></MenuItem>
                                {users.map((user) => (
                                    <MenuItem key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status}
                                label="Status"
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <MenuItem value="todo">A Fazer</MenuItem>
                                <MenuItem value="in_progress">Em Progresso</MenuItem>
                                <MenuItem value="done">Concluído</MenuItem>
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
