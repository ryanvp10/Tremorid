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
    <div className="bg-bg-secondary border-t border-border shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 md:px-4 pt-2 pb-1">
        <h2 className="text-[10px] md:text-xs font-semibold text-text-primary">7-Day Activity</h2>
        {loading && <span className="text-[9px] text-text-secondary">Loading...</span>}
        {error && <span className="text-[9px] text-red-500">Error</span>}
      </div>

      {/* Bars + Labels */}
      <div className="grid grid-cols-7 gap-0.5 md:gap-1 px-2 md:px-3 pb-2">
        {dailyCounts.map((day) => {
          const pct = maxCount > 0 ? (day.count / maxCount) * 100 : 0
          const barH = Math.max(pct, 6)

          return (
            <div key={day.key} className="flex flex-col items-center justify-end">
              {/* Count */}
              <span className="text-[9px] md:text-[10px] text-text-primary font-medium mb-0.5 leading-none">{day.count}</span>

              {/* Bar container — fixed height */}
              <div className="w-full bg-bg-primary rounded-sm overflow-hidden" style={{ height: '28px' }}>
                <div
                  className="w-full bg-blue-500 rounded-sm transition-all duration-300"
                  style={{ height: `${barH}%`, marginTop: `${100 - barH}%` }}
                />
              </div>

              {/* Two-line label: weekday + date */}
              <div className="flex flex-col items-center leading-none mt-0.5">
                <span className="text-[8px] md:text-[9px] text-text-secondary">{day.weekday}</span>
                <span className="text-[8px] md:text-[9px] text-text-secondary">{day.date}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Timeline
