import React, { useEffect, useState } from 'react'
import QuakeCard from './QuakeCard'
import { API_BASE } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'

function QuakeList({ filters = {} }) {
  const { t } = useLanguage()
  const [quakes, setQuakes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function fetchQuakes() {
      try {
        const params = new URLSearchParams()
        if (filters.minMag) params.append('minMag', filters.minMag)
        if (filters.maxMag) params.append('maxMag', filters.maxMag)
        if (filters.maxDepth) params.append('maxDepth', filters.maxDepth)

        const url = `${API_BASE}/quakes${params.toString() ? '?' + params.toString() : ''}`
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(t('list.error'))
        }

        const data = await response.json()

        if (isMounted) {
          setQuakes(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || t('list.error'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchQuakes()

    return () => {
      isMounted = false
    }
  }, [filters])

  const activeFilterCount = [filters.minMag, filters.maxMag, filters.maxDepth].filter(Boolean).length

  return (
    <section className="min-h-full bg-bg-secondary p-4 text-text-primary">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">{t('list.title')}</h2>
        {activeFilterCount > 0 && (
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent">
            {t('list.filtersActive').replace('{count}', activeFilterCount)}
          </span>
        )}
      </div>

      {loading && (
        <p className="text-sm text-text-secondary">{t('list.loading')}</p>
      )}

      {!loading && error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {!loading && !error && quakes.length === 0 && (
        <p className="text-sm text-text-secondary">{t('list.noData')}</p>
      )}

      {!loading && !error && quakes.length > 0 && (
        <div className="space-y-3">
          {quakes.map((quake, index) => (
            <QuakeCard key={quake.id ?? `${quake.datetime}-${index}`} quake={quake} />
          ))}
        </div>
      )}
    </section>
  )
}

export default QuakeList
