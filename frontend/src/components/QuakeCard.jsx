import React from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { parseWilayah } from '../lib/parseWilayah'
import { formatDate } from '../utils/formatDate'

function getMagnitudeColor(magnitude) {
  const value = Number(magnitude)

  if (value >= 5) return 'text-red-400'
  if (value >= 3) return 'text-yellow-400'
  return 'text-green-400'
}

function QuakeCard({ quake }) {
  const { t, lang } = useLanguage()
  if (!quake) return null

  const { datetime, magnitude, depth, location, tsunami, Wilayah } = quake
  const displayLocation = parseWilayah(Wilayah || location, lang) || 'Unknown location'
  const displayTsunami = translatePotensi(tsunami || '', lang)
  const hasTsunamiPotential = (displayTsunami || '').toLowerCase().includes('tsunami')

  return (
    <article className="rounded-lg border border-border bg-bg-card p-4 text-text-primary shadow-lg">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold leading-snug">
          {displayLocation}
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
        {formatDate(datetime)}
      </time>
    </article>
  )
}

export default QuakeCard
