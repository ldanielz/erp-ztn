import React, { useEffect, useState, useRef } from 'react'
import {
    Box,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Stack,
    Alert,
    Snackbar
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, UploadFile as UploadIcon, Download as DownloadIcon, Info as InfoIcon } from '@mui/icons-material'
import api from '../api/axios'
import ErbDialog from '../components/ErbDialog'
import ErbDetailsDialog from '../components/ErbDetailsDialog'
import { Pagination } from '@mui/material'

interface Erb {
    id: number
    site_id: string
    name?: string
    latitude: number | string
    longitude: number | string
    address?: string
    status: string
    created_at: string
}

export default function Erbs(): JSX.Element {
    const [erbs, setErbs] = useState<Erb[]>([])
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedErb, setSelectedErb] = useState<Erb | null>(null)
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [detailsErbId, setDetailsErbId] = useState<number | null>(null)
    const [page, setPage] = useState<number>(1)
    const [limit, setLimit] = useState<number>(10)
    const [total, setTotal] = useState<number>(0)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [notification, setNotification] = useState<{ open: boolean, message: string, severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' })

    const fetchErbs = async (p = page, l = limit) => {
        try {
            const res = await api.get(`/erbs?page=${p}&limit=${l}`)
            setErbs(res.data.data)
            setTotal(res.data.total)
            setPage(res.data.page)
            setLimit(res.data.limit)
        } catch (err) {
            console.error('Failed to fetch erbs', err)
        }
    }

    useEffect(() => {
        fetchErbs()
    }, [])

    useEffect(() => {
        fetchErbs(page, limit)
    }, [page, limit])

    const handleSave = async (erbData: Partial<Erb>) => {
        try {
            if (selectedErb) {
                await api.put(`/erbs/${selectedErb.id}`, erbData)
            } else {
                await api.post('/erbs', erbData)
            }
            fetchErbs()
        } catch (err) {
            console.error('Failed to save erb', err)
            throw err
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir esta ERB?')) return
        try {
            await api.delete(`/erbs/${id}`)
            fetchErbs()
        } catch (err) {
            console.error('Failed to delete erb', err)
        }
    }

    const handleImportClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await api.post('/erbs/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setNotification({ open: true, message: `Importação concluída: ${res.data.inserted} inseridos, ${res.data.updated} atualizados.`, severity: 'success' })
            fetchErbs()
        } catch (err: any) {
            console.error('Import failed', err)
            setNotification({ open: true, message: 'Falha na importação: ' + (err.response?.data?.message || err.message), severity: 'error' })
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleExport = async () => {
        try {
            const res = await api.get('/erbs/export', { responseType: 'blob' })
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'erbs_export.xlsx')
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (err) {
            console.error('Export failed', err)
            setNotification({ open: true, message: 'Falha na exportação', severity: 'error' })
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'success'
            case 'maintenance': return 'warning'
            case 'inactive': return 'error'
            default: return 'default'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Ativa'
            case 'maintenance': return 'Manutenção'
            case 'inactive': return 'Inativa'
            default: return status
        }
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    ERBs (Infraestrutura)
                </Typography>
                <Stack direction="row" spacing={2}>
                    <input
                        type="file"
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx, .xls"
                    />
                    <Button
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        onClick={handleImportClick}
                    >
                        Importar
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<DownloadIcon />}
                        onClick={handleExport}
                    >
                        Exportar
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => { setSelectedErb(null); setOpenDialog(true); }}
                    >
                        Nova ERB
                    </Button>
                </Stack>
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: 3 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>ID</strong></TableCell>
                                <TableCell><strong>Site ID</strong></TableCell>
                                <TableCell><strong>Latitude</strong></TableCell>
                                <TableCell><strong>Longitude</strong></TableCell>
                                <TableCell><strong>Endereço</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell align="right"><strong>Ações</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {erbs.map((erb) => (
                                <TableRow key={erb.id} hover>
                                    <TableCell>{erb.id}</TableCell>
                                    <TableCell>{erb.site_id || erb.name}</TableCell>
                                    <TableCell>{erb.latitude || '-'}</TableCell>
                                    <TableCell>{erb.longitude || '-'}</TableCell>
                                    <TableCell>{erb.address || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(erb.status)}
                                            size="small"
                                            color={getStatusColor(erb.status) as any}
                                            variant="filled"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="info"
                                            onClick={() => { setDetailsErbId(erb.id); setDetailsOpen(true); }}
                                        >
                                            <InfoIcon />
                                        </IconButton>
                                        <IconButton
                                            color="inherit"
                                            onClick={() => { setSelectedErb(erb); setOpenDialog(true); }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(erb.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {erbs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                        Nenhuma ERB encontrada.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                <Pagination
                    count={Math.max(1, Math.ceil(total / limit))}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    color="primary"
                />
            </Box>

            <ErbDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onSave={handleSave}
                erb={selectedErb}
            />

            <ErbDetailsDialog
                open={detailsOpen}
                onClose={() => { setDetailsOpen(false); setDetailsErbId(null); }}
                erbId={detailsErbId}
            />

            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification({ ...notification, open: false })}
            >
                <Alert onClose={() => setNotification({ ...notification, open: false })} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    )
}
