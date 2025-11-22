const { pool } = require('../config/db')

async function list(req, res) {
    try {
        const result = await pool.query('SELECT * FROM clients ORDER BY created_at DESC')
        return res.json(result.rows)
    } catch (err) {
        console.error('list clients error', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

async function create(req, res) {
    const { name, type, document, contact_info } = req.body
    if (!name) return res.status(400).json({ message: 'Name is required' })

    try {
        const result = await pool.query(
            'INSERT INTO clients (name, type, document, contact_info) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, type || 'B2B', document, contact_info]
        )
        return res.status(201).json(result.rows[0])
    } catch (err) {
        console.error('create client error', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

async function update(req, res) {
    const { id } = req.params
    const { name, type, document, contact_info, status } = req.body

    try {
        const result = await pool.query(
            `UPDATE clients SET 
        name = COALESCE($1, name), 
        type = COALESCE($2, type), 
        document = COALESCE($3, document), 
        contact_info = COALESCE($4, contact_info), 
        status = COALESCE($5, status) 
       WHERE id = $6 RETURNING *`,
            [name, type, document, contact_info, status, id]
        )
        if (result.rows.length === 0) return res.status(404).json({ message: 'Client not found' })
        return res.json(result.rows[0])
    } catch (err) {
        console.error('update client error', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

async function remove(req, res) {
    const { id } = req.params
    try {
        const result = await pool.query('DELETE FROM clients WHERE id = $1 RETURNING id', [id])
        if (result.rows.length === 0) return res.status(404).json({ message: 'Client not found' })
        return res.json({ message: 'Client deleted' })
    } catch (err) {
        console.error('delete client error', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

module.exports = { list, create, update, remove }
