const Database = require('better-sqlite3')
const fs = require('fs')
const path = require('path')

// Use /data on HF Spaces (persistent storage), fallback to local data/ for dev
const dbDir = process.env.HF_SPACE === '1'
  ? '/data'
  : path.join(__dirname, '..', '..', 'data')
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

const db = new Database(path.join(dbDir, 'tremorid.db'))

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS earthquakes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    datetime TEXT NOT NULL,
    magnitude REAL NOT NULL,
    depth REAL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    location TEXT,
    felt TEXT,
    tsunami TEXT,
    ai_summary TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(datetime, latitude, longitude)
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id TEXT NOT NULL UNIQUE,
    username TEXT,
    subscribed_at TEXT DEFAULT (datetime('now')),
    is_active INTEGER DEFAULT 1
  );
`)

// Earthquake functions
function getAllQuakes(limit = 100, filters = {}) {
  const { minMag, maxMag, maxDepth } = filters
  const conditions = []
  const params = []

  if (minMag !== undefined && minMag !== '') {
    conditions.push('magnitude >= ?')
    params.push(parseFloat(minMag))
  }
  if (maxMag !== undefined && maxMag !== '') {
    conditions.push('magnitude <= ?')
    params.push(parseFloat(maxMag))
  }
  if (maxDepth !== undefined && maxDepth !== '') {
    conditions.push('depth <= ?')
    params.push(parseFloat(maxDepth))
  }

  const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
  const query = `SELECT * FROM earthquakes ${whereClause} ORDER BY datetime DESC LIMIT ?`
  params.push(limit)

  return db.prepare(query).all(...params)
}

function getLatestQuake() {
  return db.prepare(
    'SELECT * FROM earthquakes ORDER BY datetime DESC LIMIT 1'
  ).get()
}

function getQuakeById(id) {
  return db.prepare(
    'SELECT * FROM earthquakes WHERE id = ?'
  ).get(id)
}

function insertQuake(quake) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO earthquakes (datetime, magnitude, depth, latitude, longitude, location, felt, tsunami)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  return stmt.run(
    quake.datetime,
    quake.magnitude,
    quake.depth,
    quake.latitude,
    quake.longitude,
    quake.location,
    quake.felt,
    quake.tsunami
  )
}

function getQuakesNear(lat, lon, radiusKm = 200) {
  // Haversine formula in SQL
  return db.prepare(`
    SELECT *, (
      6371 * acos(
        cos(radians(?)) * cos(radians(latitude)) *
        cos(radians(longitude) - radians(?)) +
        sin(radians(?)) * sin(radians(latitude))
      )
    ) AS distance
    FROM earthquakes
    WHERE distance <= ?
    ORDER BY distance ASC
  `).all(lat, lon, lat, radiusKm)
}

// Subscriber functions
function getSubscribers() {
  return db.prepare(
    'SELECT * FROM subscribers WHERE is_active = 1'
  ).all()
}

function addSubscriber(chatId, username) {
  const stmt = db.prepare(`
    INSERT INTO subscribers (chat_id, username, is_active)
    VALUES (?, ?, 1)
    ON CONFLICT(chat_id) DO UPDATE SET
      is_active = 1,
      username = excluded.username
  `)
  return stmt.run(chatId, username)
}

function removeSubscriber(chatId) {
  const stmt = db.prepare(
    'UPDATE subscribers SET is_active = 0 WHERE chat_id = ?'
  )
  return stmt.run(chatId)
}

module.exports = {
  db,
  getAllQuakes,
  getLatestQuake,
  getQuakeById,
  insertQuake,
  getQuakesNear,
  getSubscribers,
  addSubscriber,
  removeSubscriber,
}
