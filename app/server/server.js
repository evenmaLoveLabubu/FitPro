import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import { config } from './config/index.js'
import app from './app.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Serve production build (if exists)
const distPath = path.join(__dirname, '../dist')
app.use(express.static(distPath))
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

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
