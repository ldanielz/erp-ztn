import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material'
import axios from '../../api/axios'
import { materialYouPalette } from '../../assets/js/materialYou'

interface User {
    id: number
    email: string
    name: string
    role: string
    created_at: string
}

interface AdminUsersDialogProps {
    open: boolean
    onClose: () => void
}

export default function AdminUsersDialog({ open, onClose }: AdminUsersDialogProps) {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            fetchUsers()
        }
    }, [open])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await axios.get('/api/admin/users')
            setUsers(response.data)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao carregar usuários')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, color: materialYouPalette.primary.primary }}>
                Gerenciar Usuários
            </DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {loading ? (
                    <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />
                ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${materialYouPalette.neutral.outlineVariant}` }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>ID</TableCell>
                                    <TableCell>Nome</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Data Criação</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.role}
                                                size="small"
                                                color={user.role === 'admin' ? 'primary' : 'default'}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Fechar</Button>
            </DialogActions>
        </Dialog>
    )
}
