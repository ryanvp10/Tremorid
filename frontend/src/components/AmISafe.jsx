import React, { useEffect, useState } from 'react'
import { API_BASE } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'

const MAJOR_CITIES = [
  { name: 'Jakarta', latitude: -6.21, longitude: 106.85 },
  { name: 'Bandung', latitude: -6.92, longitude: 107.62 },
  { name: 'Surabaya', latitude: -7.25, longitude: 112.75 },
  { name: 'Medan', latitude: 3.59, longitude: 98.67 },
  { name: 'Makassar', latitude: -5.15, longitude: 119.43 },
  { name: 'Yogyakarta', latitude: -7.79, longitude: 110.37 },
  { name: 'Semarang', latitude: -6.97, longitude: 110.42 },
  { name: 'Palembang', latitude: -2.98, longitude: 104.75 },
  { name: 'Denpasar', latitude: -8.65, longitude: 115.22 },
  { name: 'Balikpapan', latitude: -1.27, longitude: 116.83 },
]

const STATUS_STYLES = {
  SAFE: {
    label: 'SAFE',
    colorClass: 'border-green-500/40 bg-green-500/10 text-green-300',
    badgeClass: 'bg-green-500/20 text-green-300 ring-green-500/40',
  },
  LOW: {
    label: 'LOW',
    colorClass: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
    badgeClass: 'bg-yellow-500/20 text-yellow-300 ring-yellow-500/40',
  },
  MODERATE: {
    label: 'MODERATE',
    colorClass: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
    badgeClass: 'bg-orange-500/20 text-orange-300 ring-orange-500/40',
  },
  HIGH: {
    label: 'HIGH',
    colorClass: 'border-red-500/40 bg-red-500/10 text-red-300',
    badgeClass: 'bg-red-500/20 text-red-300 ring-red-500/40',
  },
}

const SAFETY_TIPS = {
  SAFE: [
    'Keep an emergency bag ready with water, snacks, flashlight, and basic medicine.',
    'Save BMKG and local BPBD alert channels for official earthquake information.',
    'Review safe spots at home, school, or work away from windows and heavy furniture.',
  ],
  LOW: [
    'Stay calm and monitor official BMKG updates for the next several hours.',
    'Check shelves, gas cylinders, and hanging objects so they cannot fall during shaking.',
    'Prepare shoes, phone charger, ID, and a small go-bag near your exit route.',
    'Talk with family or coworkers about where to meet if communication is disrupted.',
  ],
  MODERATE: [
    'Be ready to Drop, Cover, and Hold On if shaking starts.',
    'Avoid damaged buildings, steep slopes, bridges, and coastal areas until authorities say they are safe.',
    'Keep your phone charged and follow BMKG, BNPB, and local BPBD instructions only.',
    'If you are near the coast and feel strong or long shaking, move to higher ground immediately.',
  ],
  HIGH: [
    'Move away from unsafe structures and follow evacuation instructions from local authorities.',
    'If you are in a coastal area, evacuate to higher ground without waiting for a tsunami siren.',
    'Do not use elevators; use stairs and protect your head from falling debris.',
    'Check for injuries, gas leaks, and electrical hazards only when shaking has stopped.',
    'Use SMS or messaging apps to reduce network congestion and tell family you are safe.',
  ],
}

function toRadians(value) {
  return (value * Math.PI) / 180
}

function haversineDistanceKm(origin, destination) {
  const earthRadiusKm = 6371
  const deltaLat = toRadians(destination.latitude - origin.latitude)
  const deltaLng = toRadians(destination.longitude - origin.longitude)
  const lat1 = toRadians(origin.latitude)
  const lat2 = toRadians(destination.latitude)

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return earthRadiusKm * c
}

function getQuakeValue(quake, fields) {
  return fields.find((field) => quake[field] !== undefined && quake[field] !== null)
}

function getQuakeCoordinates(quake) {
  const latField = getQuakeValue(quake, ['latitude', 'lat', 'Latitude', 'lintang'])
  const lngField = getQuakeValue(quake, ['longitude', 'lng', 'lon', 'Longitude', 'bujur'])
  const latitude = Number(quake[latField])
  const longitude = Number(quake[lngField])

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return { latitude, longitude }
  }

  const coordinates = quake.coordinates || quake.Coordinates || quake.coords
  if (Array.isArray(coordinates) && coordinates.length >= 2) {
    const [first, second] = coordinates.map(Number)
    if (Number.isFinite(first) && Number.isFinite(second)) {
      return { latitude: first, longitude: second }
    }
  }

  if (typeof coordinates === 'string') {
    const [first, second] = coordinates.split(',').map((value) => Number(value.trim()))
    if (Number.isFinite(first) && Number.isFinite(second)) {
      return { latitude: first, longitude: second }
    }
  }

  return null
}

function getQuakeMagnitude(quake) {
  const magnitudeField = getQuakeValue(quake, [
    'magnitude',
    'mag',
    'Magnitude',
    'magnitudo',
  ])
  const magnitude = Number(quake[magnitudeField])

  return Number.isFinite(magnitude) ? magnitude : 0
}

function findMatchingCity(locationName) {
  const normalizedInput = locationName.trim().toLowerCase()

  if (!normalizedInput) return null

  return MAJOR_CITIES.find((city) => {
    const cityName = city.name.toLowerCase()
    return cityName.includes(normalizedInput) || normalizedInput.includes(cityName)
  }) || null
}

function getSafetyStatus(nearbyQuakes) {
  if (nearbyQuakes.length === 0) return 'SAFE'

  const largestMagnitude = Math.max(...nearbyQuakes.map((quake) => quake.magnitude))

  if (largestMagnitude >= 6) return 'HIGH'
  if (nearbyQuakes.length >= 3 || largestMagnitude >= 4) return 'MODERATE'

  return 'LOW'
}

function normalizeQuakeResponse(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.quakes)) return data.quakes
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.earthquakes)) return data.earthquakes

  return []
}

function AmISafe() {
  const { t } = useLanguage()
  const [location, setLocation] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (error) setError('')
  }, [location])

  async function handleSubmit(event) {
    event.preventDefault()

    const city = findMatchingCity(location)
    if (!city) {
      setResult(null)
      setError(
        t('safe.errorCity').replace('{cities}', MAJOR_CITIES.map((item) => item.name).join(', '))
      )
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE}/quakes?limit=50`)

      if (!response.ok) {
        throw new Error(t('safe.errorFetch'))
      }

      const data = await response.json()
      const quakes = normalizeQuakeResponse(data)
      const nearbyQuakes = quakes
        .map((quake) => {
          const coordinates = getQuakeCoordinates(quake)
          if (!coordinates) return null

          const distanceKm = haversineDistanceKm(city, coordinates)
          return {
            ...quake,
            distanceKm,
            magnitude: getQuakeMagnitude(quake),
          }
        })
        .filter((quake) => quake && quake.distanceKm <= 500)
        .sort((first, second) => first.distanceKm - second.distanceKm)

      const largestMagnitude = nearbyQuakes.length
        ? Math.max(...nearbyQuakes.map((quake) => quake.magnitude))
        : 0
      const status = getSafetyStatus(nearbyQuakes)

      setResult({
        city,
        nearbyQuakes,
        largestMagnitude,
        status,
      })
    } catch (err) {
      setResult(null)
      setError(err.message || t('safe.errorGeneral'))
    } finally {
      setLoading(false)
    }
  }

  const status = result?.status || 'SAFE'
  const statusStyle = STATUS_STYLES[status]

  return (
    <section className="bg-bg-secondary border border-border rounded-lg p-4 text-text-primary shadow-lg">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">{t('safe.title')}</h2>
        <p className="mt-1 text-sm text-text-secondary">
          {t('safe.description')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-sm font-medium text-text-secondary" htmlFor="safe-location">
          {t('safe.cityLabel')}
        </label>
        <input
          id="safe-location"
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder={t('safe.placeholder')}
          className="w-full rounded-lg border border-border bg-bg-card px-3 py-2 text-sm text-text-primary outline-none transition placeholder:text-text-secondary focus:border-accent focus:ring-2 focus:ring-accent/30"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? t('safe.checking') : t('safe.check')}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {result && (
        <article className={`mt-4 rounded-lg border p-4 ${statusStyle.colorClass}`}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-text-primary">
                {result.city.name}
              </h3>
              <p className="mt-1 text-xs text-text-secondary">
                {t('safe.coordinates')}: {result.city.latitude.toFixed(2)}, {result.city.longitude.toFixed(2)}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyle.badgeClass}`}>
              {statusStyle.label}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border border-border bg-bg-card/70 p-3">
              <p className="text-xs text-text-secondary">{t('safe.recentQuakes')}</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {result.nearbyQuakes.length}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-bg-card/70 p-3">
              <p className="text-xs text-text-secondary">{t('safe.largestMagnitude')}</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">
                {result.nearbyQuakes.length ? result.largestMagnitude.toFixed(1) : '-'}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-semibold text-text-primary">{t('safe.safetyTips')}</h4>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-secondary">
              {SAFETY_TIPS[status].map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </div>
        </article>
      )}
    </section>
  )
}

export default AmISafe
