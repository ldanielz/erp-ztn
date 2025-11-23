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

interface Client {
    id?: number
    name: string
    type: string
    document: string
    contact_info: string
}

interface ClientDialogProps {
    open: boolean
    onClose: () => void
    onSave: (client: Client) => Promise<void>
    client?: Client | null
}

export default function ClientDialog({ open, onClose, onSave, client }: ClientDialogProps): JSX.Element {
    const [formData, setFormData] = useState<Client>({
        name: '',
        type: 'B2B',
        document: '',
        contact_info: ''
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (client) {
            setFormData(client)
        } else {
            setFormData({
                name: '',
                type: 'B2B',
                document: '',
                contact_info: ''
            })
        }
    }, [client, open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await onSave(formData)
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
                <DialogTitle>{client ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Nome"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                value={formData.type}
                                label="Tipo"
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            >
                                <MenuItem value="B2B">B2B (Empresa)</MenuItem>
                                <MenuItem value="B2C">B2C (Pessoa Física)</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Documento (CPF/CNPJ)"
                            value={formData.document}
                            onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                            fullWidth
                        />
                        <TextField
                            label="Informações de Contato"
                            value={formData.contact_info}
                            onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                            multiline
                            rows={3}
                            fullWidth
                        />
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
