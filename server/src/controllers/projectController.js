const { pool } = require('../config/db')

// Projects
async function list(req, res) {
    try {
        const result = await pool.query(`
      SELECT p.*, c.name as client_name 
      FROM projects p 
      LEFT JOIN clients c ON p.client_id = c.id 
      ORDER BY p.created_at DESC
    `)
        return res.json(result.rows)
    } catch (err) {
        console.error('list projects error', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

async function create(req, res) {
    const { name, client_id, start_date, end_date } = req.body
    if (!name) return res.status(400).json({ message: 'Name is required' })
    if (typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ message: 'Name must be a non-empty string' })
    }

    try {
        const result = await pool.query(
            'INSERT INTO projects (name, client_id, start_date, end_date) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, client_id, start_date, end_date]
        )
        return res.status(201).json(result.rows[0])
    } catch (err) {
        console.error('create project error', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

async function update(req, res) {
    const { id } = req.params
    const updateData = req.body

    try {
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No fields to update' })
        }

        // Build dynamic UPDATE query
        const columns = Object.keys(updateData)
        const setClauses = columns.map((col, i) => `${col} = $${i + 1}`).join(', ')
        const values = [...columns.map(col => updateData[col]), id]

        const result = await pool.query(
            `UPDATE projects SET ${setClauses} WHERE id = $${columns.length + 1} RETURNING *`,
            values
        )
        if (result.rows.length === 0) return res.status(404).json({ message: 'Project not found' })
        return res.json(result.rows[0])
    } catch (err) {
        console.error('update project error', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

async function remove(req, res) {
    const { id } = req.params
    try {
        const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id])
        if (result.rows.length === 0) return res.status(404).json({ message: 'Project not found' })
        return res.json({ message: 'Project deleted' })
    } catch (err) {
        console.error('delete project error', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

// Tasks
async function listTasks(req, res) {
    const { id } = req.params // project id
    try {
        const result = await pool.query('SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC', [id])
        return res.json(result.rows)
    } catch (err) {
        console.error('list tasks error', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

async function createTask(req, res) {
    const { id } = req.params // project id
    const { title, description, assignee_id } = req.body
    if (!title) return res.status(400).json({ message: 'Title is required' })

    try {
        const result = await pool.query(
            'INSERT INTO tasks (title, description, project_id, assignee_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, description, id, assignee_id]
        )
        return res.status(201).json(result.rows[0])
    } catch (err) {
        console.error('create task error', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

module.exports = { list, create, update, remove, listTasks, createTask }
