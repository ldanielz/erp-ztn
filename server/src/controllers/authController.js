const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { findUserByEmail, createUser } = require('../models/userModel')

const JWT_SECRET = process.env.JWT_SECRET || 'please-change-this-secret'

async function register(req, res) {
  const { email, password, name } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })
  try {
    const existing = await findUserByEmail(email)
    if (existing) return res.status(400).json({ message: 'Email already registered' })
    const hash = await bcrypt.hash(password, 10)
    const user = await createUser({ email, password_hash: hash, name })
    // return token on register and set httpOnly cookie for convenience
    const token = jwt.sign({ sub: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.json({ id: user.id, email: user.email, token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

async function login(req, res) {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required' })
  try {
    const user = await findUserByEmail(email)
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' })
    const token = jwt.sign({ sub: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' })
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    res.json({ token })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
}

async function me(req, res) {
  try {
    // token may come from cookie or Authorization header
    let token = null
    if (req.cookies && req.cookies.token) token = req.cookies.token
    const authHeader = req.headers['authorization']
    if (!token && authHeader && authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Not authenticated' })
    const payload = jwt.verify(token, JWT_SECRET)
    // return limited user info
    return res.json({ id: payload.sub, email: payload.email, name: payload.name })
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

async function logout(req, res) {
  try {
    res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
    return res.json({ ok: true })
  } catch (err) {
    console.error('logout error', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { register, login, me, logout }
