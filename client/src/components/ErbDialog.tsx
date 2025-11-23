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

interface Erb {
    id?: number
    site_id: string
    latitude: number | string
    longitude: number | string
    address?: string
    status: string
}

interface ErbDialogProps {
    open: boolean
    onClose: () => void
    onSave: (erb: Partial<Erb>) => Promise<void>
    erb?: Erb | null
}

export default function ErbDialog({ open, onClose, onSave, erb }: ErbDialogProps): JSX.Element {
    const [formData, setFormData] = useState<Erb>({
        site_id: '',
        latitude: '',
        longitude: '',
        address: '',
        status: 'active'
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (erb) {
            setFormData(erb)
        } else {
            setFormData({
                site_id: '',
                latitude: '',
                longitude: '',
                address: '',
                status: 'active'
            })
        }
    }, [erb, open])

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
                <DialogTitle>{erb ? 'Editar ERB' : 'Nova ERB'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Site ID"
                            value={formData.site_id}
                            onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
                            required
                            fullWidth
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Latitude"
                                value={formData.latitude}
                                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                fullWidth
                                type="number"
                            />
                            <TextField
                                label="Longitude"
                                value={formData.longitude}
                                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                fullWidth
                                type="number"
                            />
                        </Box>
                        <TextField
                            label="Endereço"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            multiline
                            rows={2}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status}
                                label="Status"
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <MenuItem value="active">Ativa</MenuItem>
                                <MenuItem value="maintenance">Em Manutenção</MenuItem>
                                <MenuItem value="inactive">Inativa</MenuItem>
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
