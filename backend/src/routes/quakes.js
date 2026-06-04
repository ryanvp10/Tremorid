const express = require('express')
const router = express.Router()
const {
  getAllQuakes,
  getLatestQuake,
  getQuakeById,
  getQuakesNear,
} = require('../db')
const { generateQuakeSummary } = require('../services/ai')

// Simple in-memory rate limiter for AI endpoints
const aiRateLimiter = new Map();
const AI_RATE_LIMIT = 5; // max 5 requests
const AI_RATE_WINDOW = 60 * 1000; // per 60 seconds

function checkAiRateLimit(clientIp) {
  const now = Date.now();
  const requests = (aiRateLimiter.get(clientIp) || []).filter(t => now - t < AI_RATE_WINDOW);
  if (requests.length >= AI_RATE_LIMIT) return false;
  requests.push(now);
  aiRateLimiter.set(clientIp, requests);
  return true;
}

// GET /api/quakes — all recent quakes (last 100) with optional filters
router.get('/', (req, res) => {
  try {
    const { minMag, maxMag, maxDepth } = req.query
    const quakes = getAllQuakes(100, { minMag, maxMag, maxDepth })
    res.json(quakes)
  } catch (err) {
    console.error('[quakes] list error:', err.message)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/quakes/latest — single latest quake
router.get('/latest', (req, res) => {
  try {
    const quake = getLatestQuake()
    if (!quake) {
      return res.status(404).json({ error: 'No earthquakes found' })
    }
    res.json(quake)
  } catch (err) {
    console.error('[quakes] latest error:', err.message)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/quakes/digest — summary for the latest quake
router.get('/digest', async (req, res) => {
  try {
    if (!checkAiRateLimit(req.ip)) {
      return res.status(429).json({ error: 'Too many requests, please try again later.' })
    }
    const quake = getLatestQuake()
    if (!quake) {
      return res.status(404).json({ error: 'No earthquakes found' })
    }

    const summary = await generateQuakeSummary(quake)
    res.json({ summary })
  } catch (err) {
    console.error('[quakes] digest error:', err.message)
    res.status(500).json({ error: 'Failed to generate summary' })
  }
})

// GET /api/quakes/near?lat=&lon=&radius= — quakes near location
router.get('/near', (req, res) => {
  try {
    const lat = parseFloat(req.query.lat)
    const lon = parseFloat(req.query.lon)
    const radius = parseFloat(req.query.radius) || 200

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'lat and lon are required' })
    }

    const quakes = getQuakesNear(lat, lon, radius)
    res.json(quakes)
  } catch (err) {
    console.error('[quakes] near error:', err.message)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// GET /api/quakes/:id/summary — summary for a single quake by id
router.get('/:id/summary', async (req, res) => {
  try {
    if (!checkAiRateLimit(req.ip)) {
      return res.status(429).json({ error: 'Too many requests, please try again later.' })
    }
    const quake = getQuakeById(req.params.id)
    if (!quake) {
      return res.status(404).json({ error: 'Earthquake not found' })
    }

    const summary = await generateQuakeSummary(quake)
    res.json({ summary })
  } catch (err) {
    console.error('[quakes] summary error:', err.message)
    res.status(500).json({ error: 'Failed to generate summary' })
  }
})

// GET /api/quakes/:id — single quake by id
router.get('/:id', (req, res) => {
  try {
    const quake = getQuakeById(req.params.id)
    if (!quake) {
      return res.status(404).json({ error: 'Earthquake not found' })
    }
    res.json(quake)
  } catch (err) {
    console.error('[quakes] detail error:', err.message)
    res.status(500).json({ error: 'Internal server error' })
  }
})

module.exports = router
