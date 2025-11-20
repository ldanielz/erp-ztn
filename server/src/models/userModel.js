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

module.exports = { findUserByEmail, createUser }
