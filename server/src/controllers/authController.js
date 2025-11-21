const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { findUserByEmail, createUser, findUserById, updateUser } = require('../models/userModel')

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
    const token = jwt.sign({ sub: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
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
    const token = jwt.sign({ sub: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
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
    // fetch latest user to include role if token missing it
    let role = payload.role
    try {
      if (!role) {
        const dbUser = await findUserById(payload.sub)
        role = dbUser?.role
      }
    } catch (e) {
      // ignore DB lookup errors
    }
    // return limited user info
    return res.json({ id: payload.sub, email: payload.email, name: payload.name, role })
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

async function updateProfile(req, res) {
  try {
    // Get user ID from token
    let token = null
    if (req.cookies && req.cookies.token) token = req.cookies.token
    const authHeader = req.headers['authorization']
    if (!token && authHeader && authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'Not authenticated' })

    let payload
    try {
      payload = jwt.verify(token, JWT_SECRET)
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    const userId = payload.sub
    const { name, email, currentPassword, newPassword } = req.body

    // Validate input
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' })

    // Fetch current user
    const user = await findUserById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    // Check email uniqueness (if changing email)
    if (email !== user.email) {
      const existing = await findUserByEmail(email)
      if (existing) return res.status(400).json({ message: 'Email already in use' })
    }

    // If changing password, verify current password
    const updateData = { name, email }
    if (currentPassword && newPassword) {
      const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash)
      if (!passwordMatch) return res.status(401).json({ message: 'Current password is incorrect' })
      updateData.password_hash = await bcrypt.hash(newPassword, 10)
    }

    // Update user in database
    const updatedUser = await updateUser(userId, updateData)
    if (!updatedUser) return res.status(500).json({ message: 'Failed to update profile' })

    // Generate new token with updated info
    const newToken = jwt.sign({ sub: updatedUser.id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role }, JWT_SECRET, { expiresIn: '7d' })
    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      message: 'Profile updated successfully'
    })
  } catch (err) {
    console.error('updateProfile error', err)
    return res.status(500).json({ message: 'Server error' })
  }
}

module.exports = { register, login, me, logout, updateProfile }
