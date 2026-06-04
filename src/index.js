const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const { protect } = require('./middleware/auth')
const authRoutes = require('./routes/auth')
const courseRoutes = require('./routes/courses')
const materialRoutes = require('./routes/materials')

dotenv.config()

// connect to DB
connectDB()

const app = express()

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/courses/:courseId/materials', materialRoutes)

// Test Routes
app.get('/', (req, res) => {
    res.json({
        message: 'AliceTutor API is running'
    })
})

app.get('/api/protected', protect, (req, res) => {
    res.json({
      success: true,
      message: `Hello ${req.student.firstName}, you are authenticated`,
    })
  })

const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})