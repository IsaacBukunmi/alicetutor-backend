import express from 'express'
import { protect } from '../middleware/auth.js'
import upload from '../middleware/upload.js'
import { upload as uploadMaterial, getAll, getOne, remove } from '../controllers/material.controller.js'

const router = express.Router({ mergeParams: true })

router.use(protect)

router.post('/', upload.single('file'), uploadMaterial)
router.get('/', getAll)
router.get('/:materialId', getOne)
router.delete('/:materialId', remove)


export default router