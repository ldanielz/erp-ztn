const { pool } = require('../config/db')

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

module.exports = { stats, recentUsers }
