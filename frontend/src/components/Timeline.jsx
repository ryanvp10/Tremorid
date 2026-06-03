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
    <div className="bg-bg-secondary border-t border-border px-3 md:px-4 py-2 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-xs md:text-sm font-semibold text-text-primary">7-Day Activity</h2>
        {loading && <span className="text-[10px] text-text-secondary">Loading...</span>}
        {error && <span className="text-[10px] text-red-500">Error</span>}
      </div>

      {/* 7 columns: count + bar + weekday + date */}
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {dailyCounts.map((day) => {
          const pct = maxCount > 0 ? (day.count / maxCount) * 100 : 0
          const barH = Math.max(pct, 6)

          return (
            <div key={day.key} className="flex flex-col items-center justify-end h-16 md:h-20">
              {/* Count number */}
              <span className="text-[10px] md:text-xs text-text-primary font-medium leading-tight">{day.count}</span>

              {/* Bar */}
              <div className="w-full bg-bg-primary rounded-sm overflow-hidden h-7 md:h-9 mt-0.5">
                <div
                  className="w-full bg-blue-500 rounded-sm transition-all duration-300"
                  style={{ height: `${barH}%`, marginTop: `${100 - barH}%` }}
                />
              </div>

              {/* Labels stacked below bar */}
              <div className="flex flex-col items-center leading-tight mt-0.5">
                <span className="text-[9px] md:text-[10px] text-text-secondary whitespace-nowrap">{day.weekday}</span>
                <span className="text-[9px] md:text-[10px] text-text-secondary whitespace-nowrap">{day.date}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Timeline
