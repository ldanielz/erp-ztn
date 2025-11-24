const rateLimit = require('express-rate-limit')

// Conservative write limiter: protects create/update/delete endpoints
const writeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // max 10 write requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please slow down.' }
})

// Import endpoint limiter: file upload sensitive
const importLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // max 5 imports per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many import requests, please wait a moment.' }
})

module.exports = { writeLimiter, importLimiter }
