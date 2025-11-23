const { pool } = require('../config/db')

async function list(req, res) {
    try {
        const result = await pool.query('SELECT * FROM erbs ORDER BY created_at DESC')
        return res.json(result.rows)
    } catch (err) {
        console.error('list erbs error', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

async function create(req, res) {
    const { site_id, latitude, longitude, address, status } = req.body
    if (!site_id) return res.status(400).json({ message: 'Site ID is required' })

    try {
        const result = await pool.query(
            'INSERT INTO erbs (site_id, latitude, longitude, address, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [site_id, latitude, longitude, address, status || 'active']
        )
        return res.status(201).json(result.rows[0])
    } catch (err) {
        console.error('create erb error', err)
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
            `UPDATE erbs SET ${setClauses} WHERE id = $${columns.length + 1} RETURNING *`,
            values
        )
        if (result.rows.length === 0) return res.status(404).json({ message: 'ERB not found' })
        return res.json(result.rows[0])
    } catch (err) {
        console.error('update erb error', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

async function remove(req, res) {
    const { id } = req.params
    try {
        const result = await pool.query('DELETE FROM erbs WHERE id = $1 RETURNING id', [id])
        if (result.rows.length === 0) return res.status(404).json({ message: 'ERB not found' })
        return res.json({ message: 'ERB deleted' })
    } catch (err) {
        console.error('delete erb error', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

module.exports = { list, create, update, remove }
