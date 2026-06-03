// HF Spaces injects env vars via secrets — dotenv not needed in production
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const cors = require('cors')
const quakeRoutes = require('./routes/quakes')
const { bot, getBotWebhookHandler } = require('./telegram/bot')
const { start: startBmkgFetcher, stop: stopBmkgFetcher, handleNewQuakeAlerts } = require('./services/bmkgFetcher')

const app = express()
const PORT = parseInt(process.env.PORT || '7860', 10)
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

// Register webhook endpoint BEFORE bodyParser (same as personal-tracker)
if (process.env.TELEGRAM_BOT_TOKEN) {
  const webhookHandler = getBotWebhookHandler()
  if (webhookHandler) {
    app.post('/telegram-webhook', express.json(), webhookHandler)
    console.log('[BOT] Telegram webhook endpoint registered at /telegram-webhook')
  }
}

// Body parsers — after webhook route
app.use(express.json())

// Routes
app.use('/api/quakes', quakeRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// ── Async startup (same pattern as personal-tracker) ──
async function start() {
  // Set webhook on HF Spaces
  if (process.env.TELEGRAM_BOT_TOKEN && process.env.HF_SPACE === '1') {
    const webhookUrl = `https://ryanvp10-tremorid-api.hf.space/telegram-webhook`
    try {
      await bot.telegram.setWebhook(webhookUrl)
      console.log('[BOT] Webhook set:', webhookUrl)
    } catch (err) {
      console.error('[BOT] Webhook setup failed:', err.message)
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
    try { bot.stop(signal) } catch (e) { /* bot may not have started */ }
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
