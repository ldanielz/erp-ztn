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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ViewKanban as ViewKanbanIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import ProjectDialog from '../components/ProjectDialog'

interface Project {
    id: number
    name: string
    client_id: number
    client_name?: string
    status: string
    start_date: string
    end_date: string
    created_at: string
}

export default function Projects(): JSX.Element {
    const [projects, setProjects] = useState<Project[]>([])
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)
    const navigate = useNavigate()

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects')
            setProjects(res.data)
        } catch (err) {
            console.error('Failed to fetch projects', err)
        }
    }

    useEffect(() => {
        fetchProjects()
    }, [])

    const handleSave = async (projectData: Partial<Project>) => {
        try {
            if (selectedProject) {
                await api.put(`/projects/${selectedProject.id}`, projectData)
            } else {
                await api.post('/projects', projectData)
            }
            fetchProjects()
        } catch (err) {
            console.error('Failed to save project', err)
            throw err
        }
    }

    const handleDelete = async (id: number) => {
        if (!window.confirm('Tem certeza que deseja excluir este projeto?')) return
        try {
            await api.delete(`/projects/${id}`)
            fetchProjects()
        } catch (err) {
            console.error('Failed to delete project', err)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'planning': return 'info'
            case 'in_progress': return 'primary'
            case 'on_hold': return 'warning'
            case 'completed': return 'success'
            case 'cancelled': return 'error'
            default: return 'default'
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'planning': return 'Planejamento'
            case 'in_progress': return 'Em Andamento'
            case 'on_hold': return 'Em Espera'
            case 'completed': return 'Concluído'
            case 'cancelled': return 'Cancelado'
            default: return status
        }
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    Projetos
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => { setSelectedProject(null); setOpenDialog(true); }}
                >
                    Novo Projeto
                </Button>
            </Box>

            <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: 3 }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>ID</strong></TableCell>
                                <TableCell><strong>Nome</strong></TableCell>
                                <TableCell><strong>Cliente</strong></TableCell>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell><strong>Início</strong></TableCell>
                                <TableCell><strong>Término</strong></TableCell>
                                <TableCell align="right"><strong>Ações</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {projects.map((project) => (
                                <TableRow
                                    key={project.id}
                                    hover
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => navigate(`/projects/${project.id}`)}
                                >
                                    <TableCell>{project.id}</TableCell>
                                    <TableCell>{project.name}</TableCell>
                                    <TableCell>{project.client_name || '-'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getStatusLabel(project.status)}
                                            size="small"
                                            color={getStatusColor(project.status) as any}
                                            variant="filled"
                                        />
                                    </TableCell>
                                    <TableCell>{project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'}</TableCell>
                                    <TableCell>{project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}</TableCell>
                                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                        <IconButton
                                            color="primary"
                                            onClick={() => navigate(`/projects/${project.id}`)}
                                            title="Ver Kanban"
                                        >
                                            <ViewKanbanIcon />
                                        </IconButton>
                                        <IconButton
                                            color="inherit"
                                            onClick={() => { setSelectedProject(project); setOpenDialog(true); }}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(project.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {projects.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                        Nenhum projeto encontrado.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <ProjectDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onSave={handleSave}
                project={selectedProject}
            />
        </Box>
    )
}
