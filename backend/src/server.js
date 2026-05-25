require('dotenv').config()
const express = require('express')
const cors = require('cors')
const quakeRoutes = require('./routes/quakes')
const { getBotWebhookHandler } = require('./telegram/bot')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.use('/api/quakes', quakeRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// Telegram webhook
app.post('/api/telegram/webhook', getBotWebhookHandler())

// Start server
app.listen(PORT, () => {
  console.log(`TremorID backend running on port ${PORT}`)
})

module.exports = app
