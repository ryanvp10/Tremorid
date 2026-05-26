require('dotenv').config()
const express = require('express')
const cors = require('cors')
const quakeRoutes = require('./routes/quakes')
const { initBot } = require('./telegram/bot')
const { start: startBmkgFetcher, stop: stopBmkgFetcher, handleNewQuakeAlerts } = require('./services/bmkgFetcher')

const app = express()
const PORT = process.env.PORT || 3000
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000']

// Middleware
app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

// Routes
app.use('/api/quakes', quakeRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Telegram webhook (polling mode used on HF Spaces, webhook for production)
app.post('/api/telegram/webhook', (req, res) => {
  console.log('Telegram webhook received')
  res.sendStatus(200)
})

// Initialize Telegram bot (starts long-polling)
initBot()

// Start BMKG fetcher (every 5 min)
const bmkgTimer = startBmkgFetcher()

// Start server
const server = app.listen(PORT, () => {
  console.log(`TremorID backend running on port ${PORT}`)
})

const shutdown = (signal) => {
  console.log(`Received ${signal}, shutting down gracefully`)
  stopBmkgFetcher()
  server.close(() => {
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

module.exports = app
