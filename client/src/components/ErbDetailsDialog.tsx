import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Stack
} from '@mui/material'
import api from '../api/axios'

interface HistoryItem {
  id: number
  action: string
  changed_fields: string[] | null
  old_values: any
  new_values: any
  changed_by_user_id: number | null
  created_at: string
}

interface Props {
  open: boolean
  onClose: () => void
  erbId: number | null
}

export default function ErbDetailsDialog({ open, onClose, erbId }: Props) {
  const [loading, setLoading] = useState(false)
  const [erb, setErb] = useState<any | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !erbId) return
    setLoading(true)
    setError(null)
    api.get(`/erbs/${erbId}`).then(res => {
      setErb(res.data.erb)
      setHistory(res.data.history || [])
    }).catch(err => {
      console.error('Failed to fetch ERB details', err)
      setError(err.response?.data?.message || err.message)
    }).finally(() => setLoading(false))
  }, [open, erbId])

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalhes da ERB</DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && error && (
          <Typography color="error">{error}</Typography>
        )}

        {!loading && !error && erb && (
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>{erb.site_id || erb.name}</Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Chip label={`Status: ${erb.status || '-'} `} />
              <Chip label={`Latitude: ${erb.latitude ?? '-'} `} />
              <Chip label={`Longitude: ${erb.longitude ?? '-'} `} />
              <Chip label={`Cidade: ${erb.city ?? '-'} `} />
            </Stack>

            <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>Informações completas</Typography>
            <Box component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: 13, p: 1, bgcolor: '#fafafa', borderRadius: 1, mb: 2 }}>
              {JSON.stringify(erb, null, 2)}
            </Box>

            {erb.raw_import && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>Dados originais do Excel (raw_import)</Typography>
                <Box component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: 13, p: 1, bgcolor: '#fff3e0', borderRadius: 1, mb: 2, border: '1px solid #ffe0b2' }}>
                  {JSON.stringify(erb.raw_import, null, 2)}
                </Box>
              </>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" sx={{ mb: 1 }}>Histórico de Mudanças</Typography>
            {history.length === 0 && (
              <Typography color="text.secondary">Nenhuma alteração registrada.</Typography>
            )}
            <List>
              {history.map(h => {
                // compute changed fields list if not provided
                const oldValues = h.old_values || {}
                const newValues = h.new_values || {}
                let changed = h.changed_fields && h.changed_fields.length ? h.changed_fields : []
                if ((!changed || changed.length === 0) && h.action && (oldValues || newValues)) {
                  const keys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)])
                  changed = Array.from(keys).filter(k => {
                    const a = oldValues[k]
                    const b = newValues[k]
                    try {
                      return JSON.stringify(a) !== JSON.stringify(b)
                    } catch (e) {
                      return String(a) !== String(b)
                    }
                  })
                }

                const formatValue = (v: any) => {
                  if (v === null || v === undefined || v === '') return '-'
                  if (typeof v === 'string' && !isNaN(Date.parse(v))) {
                    return new Date(v).toLocaleString()
                  }
                  if (typeof v === 'number') return v.toString()
                  if (typeof v === 'object') return JSON.stringify(v)
                  return String(v)
                }

                return (
                  <ListItem key={h.id} alignItems="flex-start">
                    <ListItemText
                      primary={`${h.action} — ${new Date(h.created_at).toLocaleString()}`}
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>Campos alterados: {changed.length ? changed.join(', ') : '-'}</Typography>
                          {changed.map(field => (
                            <Box key={field} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 1 }}>
                              <Box sx={{ minWidth: 180 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>{field}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>De: {formatValue(oldValues[field])}</Typography>
                                <Typography variant="body2" sx={{ color: 'success.main' }}>Para: {formatValue(newValues[field])}</Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      }
                    />
                  </ListItem>
                )
              })}
            </List>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  )
}
