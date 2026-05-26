const BMKG_BASE = 'https://data.bmkg.go.id/DataMKG/TEWS';
const { db } = require('../db');

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_RESPONSE_BYTES = 1024 * 1024;
const MAX_TEXT_FIELD_LENGTH = 255;
const RETRY_DELAYS_MS = [2000, 4000, 8000];

const UPSERT_QUAKE = db.prepare(`
  INSERT INTO earthquakes (datetime, magnitude, depth, latitude, longitude, location, felt, tsunami)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(datetime, latitude, longitude) DO UPDATE SET
    magnitude = excluded.magnitude,
    depth = excluded.depth,
    location = excluded.location,
    felt = excluded.felt,
    tsunami = excluded.tsunami
`);

let refreshTimer = null;
let refreshInFlight = null;

function parseCoordinate(coordStr) {
  if (typeof coordStr !== 'string') {
    throw new Error('Coordinates must be a string');
  }

  const match = coordStr.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) {
    throw new Error(`Invalid coordinate format: ${sanitizeForLog(coordStr)}`);
  }

  const lat = Number.parseFloat(match[1]);
  const lng = Number.parseFloat(match[2]);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new Error(`Invalid coordinate value: ${sanitizeForLog(coordStr)}`);
  }

  return { lat, lng };
}

function parseDepth(depthStr) {
  if (typeof depthStr !== 'string') {
    throw new Error('Depth must be a string');
  }

  const match = depthStr.trim().match(/^(\d+)\s*km$/i);
  if (!match) {
    throw new Error(`Invalid depth value: ${sanitizeForLog(depthStr)}`);
  }

  const depth = Number.parseInt(match[1], 10);
  if (Number.isNaN(depth)) {
    throw new Error(`Invalid depth value: ${sanitizeForLog(depthStr)}`);
  }

  return depth;
}

function sanitizeForLog(value) {
  return String(value)
    .replace(/[\r\n\t]/g, ' ')
    .replace(/[^\x20-\x7E]/g, '?')
    .slice(0, 200);
}

function normalizeTextField(value, fieldName, { required = false } = {}) {
  if (value == null || value === '') {
    if (required) {
      throw new Error(`Missing or invalid ${fieldName}`);
    }

    return null;
  }

  if (typeof value !== 'string') {
    throw new Error(`Invalid ${fieldName} type`);
  }

  const normalized = value.trim();
  if (!normalized) {
    if (required) {
      throw new Error(`Missing or invalid ${fieldName}`);
    }

    return null;
  }

  if (normalized.length > MAX_TEXT_FIELD_LENGTH) {
    throw new Error(`${fieldName} exceeds max length`);
  }

  return normalized;
}

function mapQuake(item) {
  try {
    if (!item || typeof item !== 'object') {
      throw new Error('Quake item must be an object');
    }

    const datetime = normalizeTextField(item.DateTime, 'DateTime', { required: true });
    const coordinates = normalizeTextField(item.Coordinates, 'Coordinates', { required: true });
    const magnitudeText = normalizeTextField(item.Magnitude, 'Magnitude', { required: true });
    const depthText = normalizeTextField(item.Kedalaman, 'Kedalaman', { required: true });
    const location = normalizeTextField(item.Wilayah, 'Wilayah');
    const tsunami = normalizeTextField(item.Potensi, 'Potensi');
    const felt = normalizeTextField(item.Dirasakan, 'Dirasakan');

    const { lat, lng } = parseCoordinate(coordinates);
    const magnitude = Number.parseFloat(magnitudeText);
    if (!Number.isFinite(magnitude)) {
      throw new Error(`Invalid magnitude value: ${sanitizeForLog(magnitudeText)}`);
    }

    return {
      datetime,
      latitude: lat,
      longitude: lng,
      magnitude,
      depth: parseDepth(depthText),
      location,
      tsunami,
      felt,
    };
  } catch (error) {
    console.error(`[${new Date().toString()}] Skipping invalid BMKG quake item: ${error.message}`);
    return null;
  }
}

function saveQuakes(quakes) {
  const saveMany = db.transaction((items) => {
    for (const quake of items) {
      UPSERT_QUAKE.run(
        quake.datetime,
        quake.magnitude,
        quake.depth,
        quake.latitude,
        quake.longitude,
        quake.location,
        quake.felt,
        quake.tsunami
      );
    }
  });

  saveMany(quakes);
  return quakes;
}

function normalizeGempaList(data) {
  const gempa = data?.Infogempa?.gempa;
  if (Array.isArray(gempa)) {
    return gempa;
  }

  if (gempa && typeof gempa === 'object') {
    return [gempa];
  }

  return [];
}

async function fetchWithRetry(url, retries = RETRY_DELAYS_MS.length + 1) {
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const res = await fetch(url, { signal: controller.signal, redirect: 'error' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const contentLength = res.headers.get('content-length');
      if (contentLength && Number.parseInt(contentLength, 10) > MAX_RESPONSE_BYTES) {
        throw new Error(`Response too large: ${contentLength} bytes`);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const chunks = [];
      let responseBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        responseBytes += value.byteLength;
        if (responseBytes > MAX_RESPONSE_BYTES) {
          throw new Error(`Response too large: ${responseBytes} bytes`);
        }

        chunks.push(value);
      }

      const text = Buffer.concat(chunks.map((chunk) => Buffer.from(chunk))).toString('utf8');
      return JSON.parse(text);
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[i]));
    } finally {
      clearTimeout(timeout);
    }
  }
}

async function fetchLatestQuakes() {
  const data = await fetchWithRetry(`${BMKG_BASE}/gempaterkini.json`);
  const quakes = normalizeGempaList(data);
  return saveQuakes(quakes.map(mapQuake).filter(Boolean));
}

async function fetchFeltQuakes() {
  const data = await fetchWithRetry(`${BMKG_BASE}/gempadirasakan.json`);
  const quakes = normalizeGempaList(data);
  return saveQuakes(quakes.map(mapQuake).filter(Boolean));
}

async function refreshQuakes() {
  await Promise.all([
    fetchLatestQuakes(),
    fetchFeltQuakes(),
  ]);
}

function refreshQuakesOnce() {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = refreshQuakes().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

function logRefreshError(err) {
  console.error(`[${new Date().toString()}] Failed to refresh BMKG data:`, err.message);
}

function start() {
  if (refreshTimer) {
    return refreshTimer;
  }

  refreshQuakesOnce().catch(logRefreshError);

  refreshTimer = setInterval(() => {
    refreshQuakesOnce().catch(logRefreshError);
  }, REFRESH_INTERVAL_MS);

  if (typeof refreshTimer.unref === 'function') {
    refreshTimer.unref();
  }

  return refreshTimer;
}

function stop() {
  if (!refreshTimer) {
    return;
  }

  clearInterval(refreshTimer);
  refreshTimer = null;
}

module.exports = { fetchLatestQuakes, fetchFeltQuakes, start, stop };
