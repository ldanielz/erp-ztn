const express = require('express')
const router = express.Router()
const { register, login, me, logout, updateProfile } = require('../controllers/authController')
const { requireFields, validateEmailFormat } = require('../middlewares/validationMiddleware')

router.post('/register', requireFields(['name','email','password']), validateEmailFormat, register)
router.post('/login', requireFields(['email','password']), validateEmailFormat, login)
router.post('/logout', logout)
router.patch('/update-profile', requireFields(['name','email']), validateEmailFormat, updateProfile)

router.get('/me', me)

module.exports = router
