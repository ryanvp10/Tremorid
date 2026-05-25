const express = require('express')
const router = express.Router()
const {
  getAllQuakes,
  getLatestQuake,
  getQuakeById,
  getQuakesNear,
} = require('../db')

// GET /api/quakes — all recent quakes (last 100)
router.get('/', (req, res) => {
  try {
    const quakes = getAllQuakes(100)
    res.json(quakes)
  } catch (err) {
    res.status(500).json({ error: err.message })
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
    res.status(500).json({ error: err.message })
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
    res.status(500).json({ error: err.message })
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
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
