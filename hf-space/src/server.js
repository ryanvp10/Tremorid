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
const PORT = process.env.PORT || 3000
const WEBHOOK_SECRET_HEADER = 'x-telegram-bot-api-secret-token'
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000']

// CORS — must be before everything else
app.use(cors({ origin: allowedOrigins }))

// ── Register webhook endpoint BEFORE express.json() ──
// Use express.raw() so Telegraf's webhookCallback gets the raw body it needs.
if (process.env.TELEGRAM_BOT_TOKEN) {
  if (!process.env.WEBHOOK_SECRET) {
    console.error('[BOT] WARNING: WEBHOOK_SECRET not set — webhook endpoint will reject all requests')
  }
  const webhookHandler = getBotWebhookHandler()
  if (webhookHandler) {
    app.post('/telegram-webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
      const secretToken = req.get(WEBHOOK_SECRET_HEADER)
      if (!secretToken || secretToken !== process.env.WEBHOOK_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
      // Parse the raw body into JSON for Telegraf
      try {
        req.body = JSON.parse(req.body.toString('utf8'))
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON' })
      }
      webhookHandler(req, res, next)
    })
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

// ── setWebhook with retry (non-blocking, non-fatal) ──
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function setWebhookWithRetry(botInstance, url, maxRetries = 5, delayMs = 5000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await botInstance.telegram.setWebhook(url)
      console.log(`[BOT] Webhook set to ${url} (attempt ${attempt})`)
      return true
    } catch (err) {
      console.warn(`[BOT] setWebhook attempt ${attempt}/${maxRetries} failed: ${err.message}`)
      if (attempt < maxRetries) {
        console.log(`[BOT] Retrying in ${delayMs / 1000}s...`)
        await sleep(delayMs)
      }
    }
  }
  console.error(`[BOT] setWebhook failed after ${maxRetries} attempts — continuing without it. Configure webhook manually or restart when api.telegram.org is reachable.`)
  return false
}

// ── Async startup ──
async function start() {
  // Start Telegram bot — webhook on HF Spaces, polling locally
  if (process.env.TELEGRAM_BOT_TOKEN) {
    if (process.env.HF_SPACE === '1') {
      // Webhook mode: set webhook to our public HF Space URL
      const webhookUrl = process.env.WEBHOOK_URL || `https://${process.env.SPACES_ID}.hf.space/telegram-webhook`
      setWebhookWithRetry(bot, webhookUrl).catch(() => {
        // Already logged inside setWebhookWithRetry — server continues
      })
    } else {
      // Polling mode for local dev
      bot.launch().then(() => console.log('[BOT] Telegram bot polling started'))
        .catch(err => console.error('[BOT] Failed to start:', err.message))
    }
  } else {
    console.log('[BOT] No TELEGRAM_BOT_TOKEN, skipping bot')
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
