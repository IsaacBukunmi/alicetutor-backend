const express = require('express')
const router = express.Router({ mergeParams: true })
const { protect } = require('../middleware/upload')
const upload = require('../middleware/upload')

router.use(protect)

const { upload: uploadMaterial, getAll, getOne, remove } = require('../controllers/material.controller')

router.post('/', upload.single('file'), uploadMaterial)
router.get('/', getAll)
router.get('/:materialId', getOne)
router.delete('/:materialId', remove)


module.exports = router