import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'

function formatDatetime(datetime) {
  if (!datetime) return '-'

  const rawValue = String(datetime).trim()
  const hasExplicitTimezone = /(?:Z|[+-]\d{2}:\d{2})$/i.test(rawValue)
  const localDateMatch = !hasExplicitTimezone
    ? rawValue.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/)
    : null

  if (localDateMatch) {
    const [, year, month, day, hour, minute] = localDateMatch
    return `${day}/${month}/${year}, ${hour}:${minute} WIB`
  }

  const date = new Date(datetime)

  if (Number.isNaN(date.getTime())) {
    return `${rawValue} WIB`
  }

  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const getPart = (type) => parts.find((part) => part.type === type)?.value

  return `${getPart('day')}/${getPart('month')}/${getPart('year')}, ${getPart(
    'hour'
  )}:${getPart('minute')} WIB`
}

function getMagnitudeColor(magnitude) {
  const value = Number(magnitude)

  if (value >= 5) return 'text-red-400'
  if (value >= 3) return 'text-yellow-400'
  return 'text-green-400'
}

function QuakeCard({ quake }) {
  const { t } = useLanguage()
  if (!quake) return null

  const { datetime, magnitude, depth, location, tsunami } = quake
  const hasTsunamiPotential = String(tsunami || '')
    .toLowerCase()
    .includes('potensi')

  return (
    <article className="rounded-lg border border-border bg-bg-card p-4 text-text-primary shadow-lg">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug">
          {location || 'Unknown location'}
        </h3>

        {hasTsunamiPotential && (
          <span className="shrink-0 rounded border border-red-500/40 bg-red-500/20 px-2 py-1 text-xs font-bold tracking-wide text-red-300">
            {t('detail.tsunamiRisk')}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-text-secondary">{t('detail.magnitude')}</p>
          <p className={`text-2xl font-bold ${getMagnitudeColor(magnitude)}`}>
            {magnitude ?? '-'}
          </p>
        </div>

        <div>
          <p className="text-xs text-text-secondary">{t('detail.depth')}</p>
          <p className="font-medium">{depth ?? '-'} {t('card.km')}</p>
        </div>
      </div>

      <time className="mt-3 block text-sm text-text-secondary" dateTime={datetime}>
        {formatDatetime(datetime)}
      </time>
    </article>
  )
}

export default QuakeCard
