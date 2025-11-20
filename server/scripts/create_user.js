const { Pool } = require('pg')
const bcrypt = require('bcrypt')
require('dotenv').config()

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL
  if (!DATABASE_URL) {
    console.error('Please set DATABASE_URL in .env before running this script')
    process.exit(1)
  }
  const pool = new Pool({ connectionString: DATABASE_URL })
  const email = process.argv[2]
  const password = process.argv[3]
  const name = process.argv[4] || null
  if (!email || !password) {
    console.error('Usage: node scripts/create_user.js <email> <password> [name]')
    process.exit(1)
  }
  try {
    const hash = await bcrypt.hash(password, 10)
    const res = await pool.query('INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING *', [email, hash, name])
    console.log('Created user:', res.rows[0])
  } catch (err) {
    console.error('Error creating user', err)
  } finally {
    await pool.end()
  }
}

main()
