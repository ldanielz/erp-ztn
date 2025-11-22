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
    const { name, lat, long, address } = req.body
    if (!name) return res.status(400).json({ message: 'Name is required' })

    try {
        const result = await pool.query(
            'INSERT INTO erbs (name, lat, long, address) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, lat, long, address]
        )
        return res.status(201).json(result.rows[0])
    } catch (err) {
        console.error('create erb error', err)
        return res.status(500).json({ message: 'Server error' })
    }
}

async function update(req, res) {
    const { id } = req.params
    const { name, lat, long, address, status } = req.body

    try {
        const result = await pool.query(
            `UPDATE erbs SET 
        name = COALESCE($1, name), 
        lat = COALESCE($2, lat), 
        long = COALESCE($3, long), 
        address = COALESCE($4, address), 
        status = COALESCE($5, status) 
       WHERE id = $6 RETURNING *`,
            [name, lat, long, address, status, id]
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
