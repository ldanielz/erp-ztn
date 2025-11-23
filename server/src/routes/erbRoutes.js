const express = require('express')
const router = express.Router()
const { list, create, update, remove } = require('../controllers/erbController')
const { requireAdmin } = require('../middlewares/adminMiddleware')
const { requireFields } = require('../middlewares/validationMiddleware')

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { importErbs, exportErbs } = require('../controllers/importController');

// Protect all routes with admin middleware for now
router.use(requireAdmin)

router.post('/import', upload.single('file'), importErbs)
router.get('/export', exportErbs)

router.get('/', list)
router.post('/', requireFields(['site_id']), create)
router.put('/:id', update)
router.delete('/:id', remove)

module.exports = router
