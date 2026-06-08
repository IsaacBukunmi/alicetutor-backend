import express from 'express'
import { protect } from '../middleware/auth.js'
import { fetchQuiz, getProgress, submitQuiz } from '../controllers/quiz.controller.js'

const router = express.Router({ mergeParams: true })

router.use(protect)

router.get('/', fetchQuiz)
router.post ('/', submitQuiz)
router.get('/progress', getProgress)

export default router