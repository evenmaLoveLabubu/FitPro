import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from './config/index.js'
import { errorHandler } from './middleware/errorHandler.js'

// Routes
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import planRoutes from './routes/plans.js'
import recordRoutes from './routes/records.js'
import checkinRoutes from './routes/checkin.js'
import exerciseRoutes from './routes/exercises.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(cors())
app.use(express.json())

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/plans', planRoutes)
app.use('/api/records', recordRoutes)
app.use('/api/checkin', checkinRoutes)
app.use('/api/exercises', exerciseRoutes)

// Serve production build (if exists)
const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// Global error handler
app.use(errorHandler)

// Connect to MongoDB and start server
mongoose.connect(config.mongoUri)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(config.port, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${config.port}`)
    })
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  })
