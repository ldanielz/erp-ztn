import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Box,
    Typography,
    Button,
    Paper,
    Grid,
    Card,
    CardContent,
    CardActions,
    Chip,
    IconButton
} from '@mui/material'
import { Add as AddIcon, ArrowBack as ArrowBackIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { materialYouPalette } from '../assets/js/materialYou'
import api from '../api/axios'
import TaskDialog from '../components/TaskDialog'

interface Task {
    id: number
    title: string
    description: string
    status: string
    assignee_id: number | null
    assignee_name?: string
}

interface Project {
    id: number
    name: string
    status: string
}

export default function ProjectKanban(): JSX.Element {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [project, setProject] = useState<Project | null>(null)
    const [tasks, setTasks] = useState<Task[]>([])
    const [openDialog, setOpenDialog] = useState(false)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)

    const fetchProjectData = async () => {
        try {
            const projectRes = await api.get(`/projects/${id}`)
            setProject(projectRes.data)
            const tasksRes = await api.get(`/projects/${id}/tasks`)
            setTasks(tasksRes.data)
        } catch (err) {
            console.error('Failed to fetch project data', err)
        }
    }

    useEffect(() => {
        if (id) {
            fetchProjectData()
        }
    }, [id])

    const handleSaveTask = async (taskData: Partial<Task>) => {
        try {
            if (selectedTask) {
                await api.put(`/projects/${id}/tasks/${selectedTask.id}`, taskData)
            } else {
                await api.post(`/projects/${id}/tasks`, taskData)
            }
            fetchProjectData()
        } catch (err) {
            console.error('Failed to save task', err)
        }
    }

    const handleDeleteTask = async (taskId: number) => {
        if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) return
        try {
            await api.delete(`/projects/${id}/tasks/${taskId}`)
            fetchProjectData()
        } catch (err) {
            console.error('Failed to delete task', err)
        }
    }

    const columns = [
        { id: 'todo', title: 'A Fazer', color: materialYouPalette.neutral.surfaceVariant },
        { id: 'in_progress', title: 'Em Progresso', color: materialYouPalette.primary.primaryContainer },
        { id: 'done', title: 'Concluído', color: materialYouPalette.secondary.secondaryContainer }
    ]

    if (!project) return <Typography>Carregando...</Typography>

    return (
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton onClick={() => navigate('/projects')}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" sx={{ color: materialYouPalette.primary.primary, fontWeight: 700 }}>
                            {project.name}
                        </Typography>
                        <Chip label={project.status} size="small" sx={{ mt: 0.5 }} />
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => { setSelectedTask(null); setOpenDialog(true); }}
                    sx={{ backgroundColor: materialYouPalette.primary.primary }}
                >
                    Nova Tarefa
                </Button>
            </Box>

            <Grid container spacing={3} sx={{ flex: 1 }}>
                {columns.map((column) => (
                    <Grid item xs={12} md={4} key={column.id}>
                        <Paper
                            sx={{
                                p: 2,
                                height: '100%',
                                backgroundColor: column.color,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2
                            }}
                        >
                            <Typography variant="h6" fontWeight="bold">
                                {column.title} ({tasks.filter(t => t.status === column.id).length})
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
                                {tasks.filter(t => t.status === column.id).map((task) => (
                                    <Card key={task.id} sx={{ cursor: 'pointer' }} onClick={() => { setSelectedTask(task); setOpenDialog(true); }}>
                                        <CardContent sx={{ pb: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {task.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {task.description}
                                            </Typography>
                                            {task.assignee_name && (
                                                <Chip label={task.assignee_name} size="small" variant="outlined" />
                                            )}
                                        </CardContent>
                                        <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                                            <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}>
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        </CardActions>
                                    </Card>
                                ))}
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <TaskDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                onSave={handleSaveTask}
                task={selectedTask}
            />
        </Box>
    )
}
