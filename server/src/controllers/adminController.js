const { pool } = require('../config/db')
const bcrypt = require('bcrypt')
const { createUser, findUserByEmail } = require('../models/userModel')
const { logEvent } = require('../utils/logger')

async function stats(req, res) {
  try {
    const usersCountRes = await pool.query('SELECT COUNT(*)::int as count FROM users')
    const usersCount = usersCountRes.rows[0].count

    const recentActivities = []
    // For now, recent activities are derived from users table (created_at)
    const recentRes = await pool.query('SELECT id, email, name, created_at FROM users ORDER BY created_at DESC LIMIT 10')
    const recentUsers = recentRes.rows

    return res.json({ usersCount, recentUsers, recentActivities })
  } catch (err) {
    console.error('admin stats error', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

async function recentUsers(req, res) {
  try {
    const recentRes = await pool.query('SELECT id, email, name, created_at FROM users ORDER BY created_at DESC LIMIT 20')
    return res.json(recentRes.rows)
  } catch (err) {
    console.error('admin recent users error', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

async function createUserEndpoint(req, res) {
  const { email, password, name } = req.body

  // Validate required fields
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required' })
  }

  try {
    // Check if email already exists
    const existing = await findUserByEmail(email)
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10)

    // Create user (role defaults to 'user' if not specified)
    const user = await createUser({ email, password_hash: hash, name })

    await logEvent('info', `Admin created new user: ${email}`, req.user?.sub)

    // Return created user (without password hash)
    return res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
      message: 'User created successfully'
    })
  } catch (err) {
    console.error('admin create user error', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

async function getAllUsers(req, res) {
  try {
    const result = await pool.query('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC')
    return res.json(result.rows)
  } catch (err) {
    console.error('admin get all users error', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

async function getLogs(req, res) {
  try {
    const result = await pool.query(`
      SELECT l.*, u.email as user_email 
      FROM system_logs l 
      LEFT JOIN users u ON l.user_id = u.id 
      ORDER BY l.created_at DESC 
      LIMIT 100
    `)
    return res.json(result.rows)
  } catch (err) {
    console.error('admin get logs error', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

async function getSettings(req, res) {
  try {
    const result = await pool.query('SELECT * FROM system_settings')
    const settings = {}
    result.rows.forEach(row => {
      settings[row.key] = row.value
    })
    return res.json(settings)
  } catch (err) {
    console.error('admin get settings error', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

async function updateSettings(req, res) {
  const settings = req.body
  try {
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      for (const [key, value] of Object.entries(settings)) {
        await client.query(
          'INSERT INTO system_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP',
          [key, value]
        )
      }
      await client.query('COMMIT')

      await logEvent('warning', 'Admin updated system settings', req.user?.sub)

      return res.json({ message: 'Settings updated successfully' })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    console.error('admin update settings error', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

module.exports = {
  stats,
  recentUsers,
  createUserEndpoint,
  getAllUsers,
  getLogs,
  getSettings,
  updateSettings
}
