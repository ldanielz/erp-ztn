const express = require('express')
const router = express.Router()
const { list, create, update, remove, getDetails } = require('../controllers/erbController')
const { requireAdmin } = require('../middlewares/adminMiddleware')
const { requireFields } = require('../middlewares/validationMiddleware')
const { writeLimiter, importLimiter } = require('../middlewares/rateLimiter')

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { importErbs, exportErbs } = require('../controllers/importController');

// Protect all routes with admin middleware for now
router.use(requireAdmin)

router.post('/import', importLimiter, upload.single('file'), importErbs)
router.get('/export', exportErbs)

router.get('/', list)
router.post('/', writeLimiter, requireFields(['site_id']), create)
router.get('/:id', getDetails)
router.put('/:id', writeLimiter, update)
router.delete('/:id', writeLimiter, remove)

module.exports = router
