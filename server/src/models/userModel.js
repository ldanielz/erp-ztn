const { pool } = require('../config/db')

async function findUserByEmail(email) {
  const res = await pool.query('SELECT * FROM users WHERE email = $1', [email])
  return res.rows[0]
}

async function createUser({ email, password_hash, name }) {
  const res = await pool.query(
    'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *',
    [email, password_hash, name]
  )
  return res.rows[0]
}

async function findUserById(id) {
  const res = await pool.query('SELECT * FROM users WHERE id = $1', [id])
  return res.rows[0]
}

async function updateUser(id, { email, name, password_hash }) {
  const updates = []
  const values = []
  let paramIndex = 1

  if (email !== undefined) {
    updates.push(`email = $${paramIndex++}`)
    values.push(email)
  }
  if (name !== undefined) {
    updates.push(`name = $${paramIndex++}`)
    values.push(name)
  }
  if (password_hash !== undefined) {
    updates.push(`password_hash = $${paramIndex++}`)
    values.push(password_hash)
  }

  if (updates.length === 0) return null

  values.push(id)
  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`
  const res = await pool.query(query, values)
  return res.rows[0]
}

module.exports = { findUserByEmail, createUser, findUserById, updateUser }
