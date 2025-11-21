const jwt = require('jsonwebtoken')
const { findUserById } = require('../models/userModel')

const JWT_SECRET = process.env.JWT_SECRET || 'please-change-this-secret'

async function extractPayload(req) {
  let token = null
  if (req.cookies && req.cookies.token) token = req.cookies.token
  const authHeader = req.headers['authorization']
  if (!token && authHeader && authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1]
  if (!token) return null
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    return payload
  } catch (err) {
    return null
  }
}

async function requireAdmin(req, res, next) {
  const payload = await extractPayload(req)
  if (!payload) return res.status(401).json({ message: 'Not authenticated' })
  // If role present in token, use it; otherwise fetch from DB
  let role = payload.role
  if (!role) {
    try {
      const user = await findUserById(payload.sub)
      role = user?.role
    } catch (e) {
      // ignore
    }
  }
  if (role !== 'admin') return res.status(403).json({ message: 'Admin access required' })
  req.user = payload
  next()
}

module.exports = { requireAdmin }
