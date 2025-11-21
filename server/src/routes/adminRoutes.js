const express = require('express')
const router = express.Router()
const { stats, recentUsers } = require('../controllers/adminController')
const { requireAdmin } = require('../middlewares/adminMiddleware')

router.get('/stats', requireAdmin, stats)
router.get('/recent-users', requireAdmin, recentUsers)

module.exports = router
