const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

dotenv.config()

const app = express()
// Security headers
app.use(helmet())
// Basic rate limiting
app.use(
	rateLimit({
		windowMs: 15 * 60 * 1000, // 15 minutes
		max: 200 // limit each IP to 200 requests per windowMs
	})
)
// CORS - allow frontend origin from env and allow cookies
app.use(
	cors({
		origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		credentials: true
	})
)

// cookie parsing for httpOnly cookies
const cookieParser = require('cookie-parser')
app.use(cookieParser())
app.use(express.json())

// DB init
const { initDb } = require('./config/db')
initDb()

// Routes
const authRoutes = require('./routes/authRoutes')
app.use('/api/auth', authRoutes)

app.get('/api/health', (req, res) => res.json({ ok: true }))

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`Server running on port ${port}`))
