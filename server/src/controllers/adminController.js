const { pool } = require('../config/db')
const bcrypt = require('bcrypt')
const { createUser, findUserByEmail } = require('../models/userModel')

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

module.exports = { stats, recentUsers, createUserEndpoint }
