require('dotenv').config()
const express = require('express')
const cors = require('cors')
const quakeRoutes = require('./routes/quakes')
const { bot, getBotWebhookHandler } = require('./telegram/bot')
const { start: startBmkgFetcher, stop: stopBmkgFetcher, handleNewQuakeAlerts } = require('./services/bmkgFetcher')

const app = express()
const PORT = process.env.PORT || 3000
const WEBHOOK_SECRET_HEADER = 'x-telegram-bot-api-secret-token'
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000']

// Middleware
app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

const validateWebhookSecret = (req, res, next) => {
  const secretToken = req.get(WEBHOOK_SECRET_HEADER)

  if (!secretToken || secretToken !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  next()
}

// Routes
app.use('/api/quakes', quakeRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Telegram webhook (polling mode used on HF Spaces, webhook for production)
app.post('/api/telegram/webhook', validateWebhookSecret, getBotWebhookHandler())

// Start Telegram bot (long-polling for dev, webhook for production)
bot.launch().then(() => console.log('[BOT] Telegram bot polling started'))

// Start BMKG fetcher (every 5 min)
const bmkgTimer = startBmkgFetcher()

// Start server
const server = app.listen(PORT, () => {
  console.log(`TremorID backend running on port ${PORT}`)
})

const shutdown = (signal) => {
  console.log(`Received ${signal}, shutting down gracefully`)
  bot.stop(signal)
  stopBmkgFetcher()
  server.close(() => {
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

module.exports = app
