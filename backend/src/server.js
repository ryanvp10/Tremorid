require('dotenv').config()
const express = require('express')
const cors = require('cors')
const quakeRoutes = require('./routes/quakes')
const { initBot, getBot, getBotWebhookHandler } = require('./telegram/bot')
const { start: startBmkgFetcher, stop: stopBmkgFetcher, handleNewQuakeAlerts } = require('./services/bmkgFetcher')

const app = express()
const PORT = process.env.PORT || 3000
const WEBHOOK_SECRET_HEADER = 'x-telegram-bot-api-secret-token'
process.on('unhandledRejection', (err) => console.error('[UNHANDLED]', err && err.message ? err.message : err))
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

async function start() {
  try {
    initBot()

    const webhookHandler = getBotWebhookHandler()
    if (webhookHandler) {
      // Telegram webhook (polling mode used on HF Spaces, webhook for production)
      app.post('/api/telegram/webhook', validateWebhookSecret, webhookHandler)
    }

    if (getBot()) {
      await getBot().launch()
      console.log('[BOT] Telegram bot polling started')
    }
  } catch (err) {
    console.error('[BOT] Bot startup failed, continuing without Telegram bot:', err.message)
  }

  // Start BMKG fetcher (every 5 min)
  const bmkgTimer = startBmkgFetcher()

  // Start server
  const server = app.listen(PORT, () => {
    console.log(`TremorID backend running on port ${PORT}`)
  })

  const shutdown = (signal) => {
    console.log(`Received ${signal}, shutting down gracefully`)
    try { if (getBot()) getBot().stop(signal) } catch (e) { /* bot may not have started */ }
    try { stopBmkgFetcher() } catch (e) { /* fetcher may not have started */ }
    server.close(() => {
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

start().catch((err) => {
  console.error('[FATAL] Failed to start server:', err)
  process.exit(1)
})

module.exports = app
