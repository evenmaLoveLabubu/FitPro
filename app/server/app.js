import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler.js'

// Routes
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import planRoutes from './routes/plans.js'
import recordRoutes from './routes/records.js'
import checkinRoutes from './routes/checkin.js'
import exerciseRoutes from './routes/exercises.js'

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

// Global error handler
app.use(errorHandler)

export default app
