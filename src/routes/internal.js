import express from 'express'
import { protect } from '../middleware/auth.js'
import QuizResult from '../models/QuizResult.js'
import Material from '../models/Material.js'
import Course from '../models/Course.js'
import Student from '../models/Student.js'

const router = express.Router()

// Protect all internal routes with JWT
router.use(protect)

// Confirm the studentId in the URL matches the token's student
router.use((req, res, next) => {
  if (
    req.params.studentId &&
    req.student._id.toString() !== req.params.studentId
  ) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
})

// GET /internal/students/:studentId/profile
router.get('/students/:studentId/profile', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId).select(
      'firstName lastName university program level courseOfStudy studyStreak lastStudiedAt'
    )
    if (!student) return res.status(404).json({ error: 'Student not found' })
    res.json({ student })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /internal/students/:studentId/weak-topics
router.get('/students/:studentId/weak-topics', async (req, res) => {
  try {
    const { courseId } = req.query
    const query = { student: req.params.studentId }
    if (courseId) query.course = courseId

    const results = await QuizResult.find(query)
      .populate('material', 'title')
      .populate('course', 'courseName courseCode')

    // Build accuracy per material
    const materialMap = {}
    for (const result of results) {
      const key = result.material._id.toString()
      if (!materialMap[key]) {
        materialMap[key] = {
          materialId: result.material._id,
          title: result.material.title,
          courseName: result.course.courseName,
          courseCode: result.course.courseCode,
          correct: 0,
          total: 0,
        }
      }
      materialMap[key].correct += result.correctCount
      materialMap[key].total += result.totalQuestions
    }

    // Calculate accuracy and filter weak topics
    const weakTopics = Object.values(materialMap)
      .map(m => ({
        ...m,
        accuracy: m.total > 0 ? Math.round((m.correct / m.total) * 100) : 0,
      }))
      .filter(m => m.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)

    res.json({ weakTopics })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /internal/students/:studentId/quiz-history
router.get('/students/:studentId/quiz-history', async (req, res) => {
  try {
    const { courseId, limit = 10 } = req.query
    const query = { student: req.params.studentId }
    if (courseId) query.course = courseId

    const results = await QuizResult.find(query)
      .populate('material', 'title')
      .populate('course', 'courseName courseCode')
      .sort({ createdAt: -1 })
      .limit(Number(limit))

    res.json({ results })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /internal/students/:studentId/materials
router.get('/students/:studentId/materials', async (req, res) => {
  try {
    const { courseId } = req.query
    const query = { student: req.params.studentId, isProcessed: true }
    if (courseId) query.course = courseId

    const materials = await Material.find(query)
      .select('title fileType createdAt')
      .populate('course', 'courseName courseCode')
      .sort({ createdAt: -1 })

    res.json({ materials })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /internal/students/:studentId/streak
router.get('/students/:studentId/streak', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId).select(
      'studyStreak lastStudiedAt'
    )
    if (!student) return res.status(404).json({ error: 'Student not found' })
    res.json({
      streak: student.studyStreak,
      lastStudiedAt: student.lastStudiedAt,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /internal/students/:studentId/courses
router.get('/students/:studentId/courses', async (req, res) => {
  try {
    const courses = await Course.find({ student: req.params.studentId })
      .select('courseName courseCode courseUnit examDate lecturerName')
      .sort({ createdAt: -1 })
    res.json({ courses })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router