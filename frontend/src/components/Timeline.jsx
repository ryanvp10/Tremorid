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
        return { key, label: date.toLocaleDateString('en-US', { weekday: 'short' }), count: 0 }
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
    <div className="bg-bg-secondary border-t border-border px-3 md:px-4 py-3 shrink-0 min-h-[100px]">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs md:text-sm font-semibold text-text-primary">7-Day Activity</h2>
        {loading && <span className="text-[10px] text-text-secondary">Loading...</span>}
        {error && <span className="text-[10px] text-red-500">Error</span>}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {dailyCounts.map((day) => {
          const pct = maxCount > 0 ? (day.count / maxCount) * 100 : 0
          const barH = Math.max(pct, 8)

          return (
            <div key={day.key} className="flex flex-col items-center">
              <span className="text-[10px] md:text-xs text-text-primary font-medium mb-1">{day.count}</span>
              <div className="w-full bg-bg-primary rounded-sm overflow-hidden" style={{ height: '40px' }}>
                <div
                  className="w-full bg-blue-500 rounded-sm transition-all duration-300"
                  style={{ height: `${barH}%`, marginTop: `${100 - barH}%` }}
                />
              </div>
              <span className="text-[9px] md:text-xs text-text-secondary mt-1">{day.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Timeline
