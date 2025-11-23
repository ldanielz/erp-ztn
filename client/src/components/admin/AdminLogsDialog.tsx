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

interface Log {
    id: number
    level: string
    message: string
    user_email: string
    created_at: string
}

interface AdminLogsDialogProps {
    open: boolean
    onClose: () => void
}

export default function AdminLogsDialog({ open, onClose }: AdminLogsDialogProps) {
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (open) {
            fetchLogs()
        }
    }, [open])

    const fetchLogs = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await axios.get('/admin/logs')
            setLogs(response.data)
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao carregar logs')
        } finally {
            setLoading(false)
        }
    }

    const getLevelColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'error': return 'error'
            case 'warning': return 'warning'
            case 'info': return 'info'
            default: return 'default'
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, color: materialYouPalette.primary.primary }}>
                Logs do Sistema
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
                                    <TableCell>Nível</TableCell>
                                    <TableCell>Mensagem</TableCell>
                                    <TableCell>Usuário</TableCell>
                                    <TableCell>Data</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {logs.length > 0 ? (
                                    logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell>{log.id}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={log.level}
                                                    size="small"
                                                    color={getLevelColor(log.level) as any}
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>{log.message}</TableCell>
                                            <TableCell>{log.user_email || '-'}</TableCell>
                                            <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">Nenhum log encontrado</TableCell>
                                    </TableRow>
                                )}
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
