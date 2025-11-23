const express = require('express')
const router = express.Router()
const {
    stats,
    recentUsers,
    createUserEndpoint,
    getAllUsers,
    getLogs,
    getSettings,
    updateSettings
} = require('../controllers/adminController')
const { requireAdmin } = require('../middlewares/adminMiddleware')
const { requireFields, validateEmailFormat } = require('../middlewares/validationMiddleware')

router.get('/stats', requireAdmin, stats)
router.get('/recent-users', requireAdmin, recentUsers)
router.post('/users', requireAdmin, requireFields(['name','email','password']), validateEmailFormat, createUserEndpoint)

router.get('/users', requireAdmin, getAllUsers)
router.get('/logs', requireAdmin, getLogs)
router.get('/settings', requireAdmin, getSettings)
router.put('/settings', requireAdmin, updateSettings)

module.exports = router
