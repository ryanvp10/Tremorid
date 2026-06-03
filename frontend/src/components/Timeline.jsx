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
        const weekday = date.toLocaleDateString('en-US', { weekday: 'short' })
        const dateNum = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
        return { key, weekday, date: dateNum, count: 0 }
      })

      const countsByDate = days.reduce((c, d) => ({ ...c, [d.key]: 0 }), {})

      quakes.forEach((q) => {
        if (!q.datetime) return
        const d = new Date(q.datetime)
        if (Number.isNaN(d.getTime())) return
        const key = d.toISOString().slice(0, 10)
        if (key in countsByDate) countsByDate[key] += 1
      })

      return days.map((d) => ({ ...d, count: countsByDate[d.key] }))
    }

    const fetchQuakes = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${API_BASE}/quakes?limit=100`)
        if (!res.ok) throw new Error('Unable to load')
        const data = await res.json()
        const quakes = Array.isArray(data) ? data : data.quakes || []
        if (isMounted) setDailyCounts(buildLastSevenDays(quakes))
      } catch (err) {
        if (isMounted) { setError(err.message); setDailyCounts(buildLastSevenDays()) }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchQuakes()
    return () => { isMounted = false }
  }, [])

  const maxCount = Math.max(...dailyCounts.map((d) => d.count), 1)

  return (
    <footer style={{ flex: '0 0 auto' }} className="bg-bg-secondary border-t border-border">
      <div className="px-3 pt-1.5 pb-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[10px] md:text-xs font-semibold text-text-primary">7-Day Activity</h2>
          {loading && <span className="text-[8px] text-text-secondary">Loading...</span>}
          {error && <span className="text-[8px] text-red-500">Error</span>}
        </div>

        {/* Bar chart grid */}
        <div className="grid grid-cols-7 gap-1 md:gap-1.5">
          {dailyCounts.map((day) => {
            const pct = maxCount > 0 ? (day.count / maxCount) * 100 : 0
            const barH = Math.max(pct, 6)

            return (
              <div key={day.key} className="flex flex-col items-center">
                {/* Count */}
                <span className="text-[8px] md:text-[10px] text-text-primary font-medium mb-0.5">{day.count}</span>

                {/* Bar */}
                <div className="w-full rounded-sm overflow-hidden bg-bg-primary" style={{ height: '22px' }}>
                  <div
                    className="w-full bg-blue-500 rounded-sm"
                    style={{ height: `${barH}%`, marginTop: `${100 - barH}%` }}
                  />
                </div>

                {/* Labels */}
                <div className="text-center mt-0.5">
                  <p className="text-[7px] md:text-[8px] text-text-secondary leading-tight">{day.weekday}</p>
                  <p className="text-[7px] md:text-[8px] text-text-secondary leading-tight">{day.date}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </footer>
  )
}

export default Timeline
