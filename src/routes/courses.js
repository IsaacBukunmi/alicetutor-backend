const express = require('express')
const { protect } = require('../middleware/auth')
const { create, getAll, getOne, update, remove } = require('../controllers/course.controller')
const router = express.Router()

router.use(protect)

router.post('/', create)
router.get('/', getAll)
router.get('/:id', getOne)
router.patch('/:id', update)
router.delete('/:id', remove)

module.exports = router