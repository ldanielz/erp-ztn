const express = require('express')
const router = express.Router()
const { list, create, update, remove, listTasks, createTask } = require('../controllers/projectController')
const { requireAdmin } = require('../middlewares/adminMiddleware')

// Protect all routes with admin middleware for now
router.use(requireAdmin)

router.get('/', list)
router.post('/', create)
router.put('/:id', update)
router.delete('/:id', remove)

// Task routes
router.get('/:id/tasks', listTasks)
router.post('/:id/tasks', createTask)

module.exports = router
