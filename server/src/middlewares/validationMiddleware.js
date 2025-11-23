// Lightweight validation middleware — avoids adding new deps

function requireFields(fields) {
  return (req, res, next) => {
    const missing = []
    for (const f of fields) {
      const val = req.body[f]
      if (val === undefined || val === null || String(val).trim() === '') missing.push(f)
    }
    if (missing.length) return res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` })
    next()
  }
}

function validateEmailFormat(req, res, next) {
  const email = req.body.email
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' })
  }
  next()
}

module.exports = { requireFields, validateEmailFormat }
