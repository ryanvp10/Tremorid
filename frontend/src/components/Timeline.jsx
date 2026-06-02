import React, { useEffect, useState } from 'react'

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

        const response = await fetch('/api/quakes?limit=100')
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
    <div className="bg-bg-secondary border-t border-border px-4 py-3 shrink-0">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-text-primary">7-Day Activity</h2>
        {loading && <span className="text-xs text-text-secondary">Loading...</span>}
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>

      <div className="flex items-end justify-between gap-3 h-28">
        {dailyCounts.map((day) => {
          const height = Math.max((day.count / maxCount) * 80, day.count > 0 ? 6 : 2)

          return (
            <div key={day.key} className="flex flex-1 flex-col items-center justify-end h-full">
              <span className="text-xs text-text-primary mb-1">{day.count}</span>
              <div
                className="w-full max-w-8 rounded-t bg-blue-600 transition-all"
                style={{ height: `${height}px` }}
                aria-label={`${day.label}: ${day.count} earthquakes`}
              />
              <span className="text-xs text-text-secondary mt-2 whitespace-nowrap">{day.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Timeline
