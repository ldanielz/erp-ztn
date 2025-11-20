const express = require('express')
const router = express.Router()
const { register, login, me, logout, updateProfile } = require('../controllers/authController')

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.patch('/update-profile', updateProfile)

router.get('/me', me)

module.exports = router
