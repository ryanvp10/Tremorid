import React, { useEffect, useState } from 'react'
import { API_BASE } from '../services/api'

function Timeline() {
  const [dailyCounts, setDailyCounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const buildLastSevenDays = (quakes = []) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today)
        date.setDate(today.getDate() - (6 - index))
        const key = date.toISOString().slice(0, 10)

        return {
          key,
          label: date.toLocaleDateString('en-US', {
            weekday: 'short',
            day: '2-digit',
          }),
          count: 0,
        }
      })

      const countsByDate = days.reduce((counts, day) => {
        counts[day.key] = 0
        return counts
      }, {})

      quakes.forEach((quake) => {
        if (!quake.datetime) return

        const quakeDate = new Date(quake.datetime)
        if (Number.isNaN(quakeDate.getTime())) return

        const key = quakeDate.toISOString().slice(0, 10)
        if (key in countsByDate) {
          countsByDate[key] += 1
        }
      })

      return days.map((day) => ({
        ...day,
        count: countsByDate[day.key],
      }))
    }

    const fetchQuakes = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${API_BASE}/quakes?limit=100`)
        if (!response.ok) {
          throw new Error('Unable to load earthquake activity')
        }

        const data = await response.json()
        const quakes = Array.isArray(data) ? data : data.quakes || []

        if (isMounted) {
          setDailyCounts(buildLastSevenDays(quakes))
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
          setDailyCounts(buildLastSevenDays())
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
  }, [])

  const maxCount = Math.max(...dailyCounts.map((day) => day.count), 1)

  return (
    <div className="bg-bg-secondary border-t border-border px-3 md:px-4 py-2 md:py-3 shrink-0">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs md:text-sm font-semibold text-text-primary">7-Day Activity</h2>
        {loading && <span className="text-xs text-text-secondary">Loading...</span>}
        {error && <span className="text-xs text-red-500">Error</span>}
      </div>

      <div className="flex items-end justify-between gap-1 md:gap-3" style={{ height: '100px' }}>
        {dailyCounts.map((day) => {
          const height = Math.max((day.count / maxCount) * 60, day.count > 0 ? 4 : 2)

          return (
            <div key={day.key} className="flex flex-1 flex-col items-center justify-end" style={{ height: '100%' }}>
              <span className="text-[10px] md:text-xs text-text-primary mb-1">{day.count}</span>
              <div
                className="w-full max-w-6 md:max-w-8 rounded-t bg-blue-600 transition-all"
                style={{ height: `${height}px` }}
                aria-label={`${day.label}: ${day.count} earthquakes`}
              />
              <span className="text-[8px] md:text-xs text-text-secondary mt-1 whitespace-nowrap truncate w-full text-center">{day.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Timeline
