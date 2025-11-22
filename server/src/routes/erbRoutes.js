const express = require('express')
const router = express.Router()
const { list, create, update, remove } = require('../controllers/erbController')
const { requireAdmin } = require('../middlewares/adminMiddleware')

// Protect all routes with admin middleware for now
router.use(requireAdmin)

router.get('/', list)
router.post('/', create)
router.put('/:id', update)
router.delete('/:id', remove)

module.exports = router
