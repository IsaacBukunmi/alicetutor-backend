import express from 'express'
import { protect } from '../middleware/auth.js'
import { create, getAll, getOne, message, remove, rename } from '../controllers/chat.controller.js'

const router = express.Router()

router.use(protect)

router.post("/sessions", create)
router.get("/sessions", getAll)
router.get("/sesions/:sessionId", getOne)
router.delete("/sessions/:sessionId", remove)
router.patch("/sessions/:sessionId/title", rename)
router.post("/sessions/:sessionId/messages", message)

export default router