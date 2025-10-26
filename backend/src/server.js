const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')
const { createServer } = require('http')
const { Server } = require('socket.io')
require('dotenv').config()

// Import routes
const authRoutes = require('./routes/authRoutes')
const elderlyRoutes = require('./routes/elderlyRoutes')
const medicationRoutes = require('./routes/medicationRoutes')
const scheduleRoutes = require('./routes/scheduleRoutes')
const adherenceRoutes = require('./routes/adherenceRoutes')
const alertRoutes = require('./routes/alertRoutes')
const reportRoutes = require('./routes/reportRoutes')
const fallRoutes = require('./routes/fallRoutes')
const chatRoutes = require('./routes/chatRoutes')

// Import middleware
const errorHandler = require('./middleware/errorHandler')
const { authenticateToken } = require('./middleware/authMiddleware')

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Data sanitization
app.use(mongoSanitize())
app.use(xss())

// Compression
app.use(compression())

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
} else {
  app.use(morgan('combined'))
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/elderly', authenticateToken, elderlyRoutes)
app.use('/api/medications', authenticateToken, medicationRoutes)
app.use('/api/schedule', authenticateToken, scheduleRoutes)
app.use('/api/adherence', authenticateToken, adherenceRoutes)
app.use('/api/alerts', authenticateToken, alertRoutes)
app.use('/api/reports', authenticateToken, reportRoutes)
app.use('/api/fall', authenticateToken, fallRoutes)
app.use("/api/chat", chatRoutes)

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  // Join user to their personal room
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`)
    console.log(`User ${userId} joined their room`)
  })

  // Handle medication reminders
  socket.on('medication-reminder', (data) => {
    socket.to(`user-${data.caregiverId}`).emit('medication_reminder', data)
  })

  // Handle missed dose alerts
  socket.on('missed-dose-alert', (data) => {
    socket.to(`user-${data.caregiverId}`).emit('missed_dose_alert', data)
  })

  // Handle fall detection alerts
  socket.on('fall-detected', (data) => {
    socket.to(`user-${data.caregiverId}`).emit('fall_detected', data)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Make io accessible to other modules
app.set('io', io)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Error handling middleware
app.use(errorHandler)

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare-assist', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB')
})
.catch((error) => {
  console.error('MongoDB connection error:', error)
  process.exit(1)
})

// Start server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Process terminated')
    mongoose.connection.close()
  })
})

module.exports = app
