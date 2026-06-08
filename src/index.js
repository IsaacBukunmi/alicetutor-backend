import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import authRoutes from './routes/auth.js'
import courseRoutes from './routes/courses.js'
import materialRoutes from './routes/materials.js'
import quizRoutes from './routes/quiz.js'

dotenv.config()

// connect to DB
connectDB()

const app = express()

// middlewares
app.use(helmet())
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/courses/:courseId/materials', materialRoutes)
app.use('/api/courses/:courseId/quiz', quizRoutes)

// test route
app.get('/', (req, res) => {
  res.json({ message: 'AliceTutor API is running' })
})

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})