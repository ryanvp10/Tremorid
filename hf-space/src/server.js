require('dotenv').config()
const express = require('express')
const cors = require('cors')
const quakeRoutes = require('./routes/quakes')
const { initBot, getBot, getBotWebhookHandler } = require('./telegram/bot')
const { start: startBmkgFetcher, stop: stopBmkgFetcher, handleNewQuakeAlerts } = require('./services/bmkgFetcher')

const app = express()
const PORT = parseInt(process.env.PORT || '7860', 10)
process.on('unhandledRejection', (err) => console.error('[UNHANDLED]', err && err.message ? err.message : err))
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://tremorid.netlify.app',
      'https://www.tremorid.netlify.app',
    ]

// CORS
app.use(cors({ origin: allowedOrigins }))

// Initialize bot and register webhook BEFORE bodyParser
initBot()
const webhookHandler = getBotWebhookHandler()
if (webhookHandler) {
  app.post('/telegram-webhook', express.json(), webhookHandler)
  console.log('[BOT] Telegram webhook endpoint registered at /telegram-webhook')
}

app.use(express.json())

// Routes
app.use('/api/quakes', quakeRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// ── Async startup (same pattern as personal-tracker) ──
async function start() {
  // Start bot in polling mode (HF Spaces can't reach Telegram API for setWebhook)
  if (getBot()) {
    try {
      await getBot().launch()
      console.log('[BOT] Telegram bot polling started')
    } catch (err) {
      console.error('[BOT] Bot launch failed:', err.message)
    }
  }

  // Start BMKG fetcher (only if not disabled)
  if (process.env.DISABLE_BMKG !== '1') {
    try {
      const bmkgTimer = startBmkgFetcher()
    } catch (err) {
      console.error('[BMKG] Failed to start:', err.message)
    }
  }

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
