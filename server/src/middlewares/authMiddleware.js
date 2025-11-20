const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'please-change-this-secret'

function requireAuth(req, res, next) {
  const auth = req.headers['authorization']
  if (!auth) return res.status(401).json({ message: 'Missing Authorization header' })
  const parts = auth.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Invalid Authorization header' })
  const token = parts[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

module.exports = { requireAuth }
