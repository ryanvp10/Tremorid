import { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { formatDate } from '../utils/formatDate'
import { parseWilayah, translatePotensi, translateDirasakan } from '../lib/parseWilayah'
import { API_BASE } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'

function getMagnitudeColor(magnitude) {
  if (!Number.isFinite(magnitude)) return 'text-text-secondary'
  if (magnitude < 4) return 'text-green-400'
  if (magnitude < 6) return 'text-yellow-300'
  if (magnitude < 8) return 'text-orange-400'
  return 'text-red-400'
}

function formatValue(value, fallback) {
  return value === undefined || value === null || value === '' ? fallback : value
}

function DetailPanel({ quake, onClose }) {
  const { t, lang } = useLanguage()

  const [summary, setSummary] = useState('')
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState('')

  useEffect(() => {
    if (!quake?.id) {
      setSummary('')
      setSummaryLoading(false)
      setSummaryError('')
      return undefined
    }

    const controller = new AbortController()

    async function fetchSummary() {
      setSummary('')
      setSummaryError('')
      setSummaryLoading(true)

      try {
        const response = await fetch(`${API_BASE}/quakes/${encodeURIComponent(quake.id)}/summary`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(t('detail.loadingSummary'))
        }

        const data = await response.json()
        const summaryText = typeof data === 'string'
          ? data
          : data.summary ?? data.text ?? data.message ?? ''

        setSummary(summaryText || t('detail.noSummary'))
      } catch (error) {
        if (error.name !== 'AbortError') {
          setSummaryError(error.message || t('detail.loadingSummary'))
        }
      } finally {
        if (!controller.signal.aborted) {
          setSummaryLoading(false)
        }
      }
    }

    fetchSummary()

    return () => {
      controller.abort()
    }
  }, [quake?.id])

  const details = useMemo(() => {
    if (!quake) return null

    const latitude = quake.latitude ?? quake.lat
    const longitude = quake.longitude ?? quake.lng
    const coordinates = latitude !== undefined && latitude !== null && longitude !== undefined && longitude !== null
      ? `${latitude}, ${longitude}`
      : t('detail.unknown')

    const depthVal = quake.Kedalaman ?? quake.depth
    const depthText = depthVal === undefined || depthVal === null || depthVal === ''
      ? t('detail.unknown')
      : /km$/i.test(String(depthVal).trim()) ? String(depthVal).trim() : `${depthVal} km`

    return {
      magnitude: Number(quake.Magnitude ?? quake.magnitude ?? quake.mag),
      magnitudeLabel: formatValue(quake.Magnitude ?? quake.magnitude ?? quake.mag, 'N/A'),
      location: formatValue(parseWilayah(quake.Wilayah || quake.location || quake.place, lang), t('detail.unknown')),
      coordinates,
      depth: depthText,
      dateTime: quake.datetime ?? quake.time ? (() => {
        const d = new Date(quake.datetime ?? quake.time)
        return Number.isNaN(d.getTime()) ? t('detail.unknown') : d
      })() : t('detail.unknown'),
      tsunamiRisk: translatePotensi(`${quake.Potensi ?? ''} ${quake.tsunami ?? ''}`, lang).toLowerCase().includes('tsunami'),
    }
  }, [quake])

  if (!quake || !details) return null

  const dateTimeDisplay = details.dateTime instanceof Date
    ? formatDate(details.dateTime)
    : details.dateTime

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-text-primary">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-border bg-bg-secondary shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('detail.close')}
          className="absolute right-3 top-3 rounded-full border border-border bg-bg-primary/80 p-2 text-text-secondary transition hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-gold"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="overflow-y-auto p-6 pr-14">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{t('detail.magnitude')}</p>
            <p className={`mt-1 text-6xl font-bold leading-none ${getMagnitudeColor(details.magnitude)}`}>
              {details.magnitudeLabel}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{t('detail.location')}</p>
              <p className="mt-1 text-lg font-medium text-text-primary">{details.location}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-bg-primary/50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{t('detail.coordinates')}</p>
                <p className="mt-1 text-sm text-text-primary">{details.coordinates}</p>
              </div>
              <div className="rounded-lg border border-border bg-bg-primary/50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{t('detail.depth')}</p>
                <p className="mt-1 text-sm text-text-primary">{details.depth}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">{t('detail.dateTime')}</p>
              <p className="mt-1 text-sm text-text-primary">{dateTimeDisplay}</p>
            </div>

            <div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${details.tsunamiRisk ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
                {details.tsunamiRisk ? t('detail.tsunamiRisk') : t('detail.noThreat')}
              </span>
            </div>

            {quake.id && (
              <section className="rounded-lg border border-border bg-bg-primary/50 p-4">
                <h2 className="text-sm font-semibold text-text-primary">{t('detail.aiSummary')}</h2>
                {summaryLoading && <p className="mt-2 text-sm text-text-secondary">{t('detail.loadingSummary')}</p>}
                {!summaryLoading && summaryError && (
                  <p className="mt-2 text-sm text-red-300">{summaryError}</p>
                )}
                {!summaryLoading && !summaryError && summary && (
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{summary}</p>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DetailPanel
