import React, { useEffect, useState } from 'react'
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
    Chip
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import api from '../api/axios'
import ClientDialog from '../components/ClientDialog'

interface Client {
    id: number
    name: string
    type: string
    document: string
    contact_info: string
    status: string
    created_at: string
}

export default function Clients(): JSX.Element {
    const [clients, setClients] = useState<Client[]>([])
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedClient, setSelectedClient] = useState<Client | null>(null)

    const fetchClients = async () => {
        try {
            const res = await api.get('/clients')
            setClients(res.data)
        } catch (err) {
            console.error('Failed to fetch clients', err)
        }
    }

    useEffect(() => {
        fetchClients()
    }, [])

    const handleSave = async (clientData: Partial<Client>) => {
        try {
            if (selectedClient) {
                await api.put(`/clients/${selectedClient.id}`, clientData)
            } else {
                await api.post('/clients', clientData)
            }
            fetchClients()
        } catch (err) {
            console.error('Failed to save client', err)
            throw err
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir este cliente?')) return
        try {
            await api.delete(`/clients/${id}`)
            fetchClients()
        } catch (err) {
            console.error('Failed to delete client', err)
        }
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Clientes
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => { setSelectedClient(null); setOpenDialog(true); }}
                >
                    Novo Cliente
                </Button>
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: 3 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>ID</strong></TableCell>
                                <TableCell><strong>Nome</strong></TableCell>
                                <TableCell><strong>Tipo</strong></TableCell>
                                <TableCell><strong>Documento</strong></TableCell>
                                <TableCell><strong>Contato</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell align="right"><strong>Ações</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {clients.map((client) => (
                                <TableRow key={client.id} hover>
                                    <TableCell>{client.id}</TableCell>
                                    <TableCell>{client.name}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={client.type}
                                            size="small"
                                            color={client.type === 'B2B' ? 'primary' : 'secondary'}
                                            variant="filled"
                                        />
                                    </TableCell>
                                    <TableCell>{client.document || '-'}</TableCell>
                                    <TableCell>{client.contact_info || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={client.status}
                                            size="small"
                                            color={client.status === 'active' ? 'success' : 'default'}
                                            variant="filled"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            color="inherit"
                                            onClick={() => { setSelectedClient(client); setOpenDialog(true); }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(client.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {clients.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                        Nenhum cliente encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <ClientDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onSave={handleSave}
                client={selectedClient}
            />
        </Box>
    )
}
