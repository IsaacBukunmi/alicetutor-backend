import express from 'express'
import { protect } from '../middleware/auth.js'
import { create, getAll, getOne, remove, update } from '../controllers/course.controller.js'
import { getCourseChats } from '../controllers/chat.controller.js'
const router = express.Router()

router.use(protect)

router.post('/', create)
router.get('/', getAll)
router.get('/:id', getOne)
router.patch('/:id', update)
router.delete('/:id', remove)
router.get('/:courseId/chat', getCourseChats)

export default router