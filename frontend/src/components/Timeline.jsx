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
    <div className="bg-bg-secondary border-t border-border px-2 pb-1 shrink-0">
      {/* Header row */}
      <div className="flex items-center justify-between px-1 pt-1 mb-0.5">
        <h2 className="text-[10px] font-semibold text-text-primary">7-Day</h2>
        {loading && <span className="text-[8px] text-text-secondary">...</span>}
        {error && <span className="text-[8px] text-red-500">err</span>}
      </div>

      {/* Single row grid: each cell = count + bar + labels */}
      <div className="grid grid-cols-7 gap-0.5">
        {dailyCounts.map((day) => {
          const pct = maxCount > 0 ? (day.count / maxCount) * 100 : 0
          const barH = Math.max(pct, 5)

          return (
            <div key={day.key} className="flex flex-col items-center" style={{ height: '52px' }}>
              {/* Count */}
              <span className="text-[9px] text-text-primary font-medium leading-none shrink-0">{day.count}</span>

              {/* Bar area — fills remaining space */}
              <div className="w-full bg-bg-primary rounded-sm overflow-hidden mt-0.5 flex-1 min-h-0">
                <div
                  className="w-full bg-blue-500 rounded-sm"
                  style={{ height: `${barH}%`, marginTop: `${100 - barH}%` }}
                />
              </div>

              {/* Labels — fixed height, never shrink */}
              <div className="shrink-0 mt-0.5 text-center leading-[1.1]">
                <div className="text-[7px] text-text-secondary">{day.weekday}</div>
                <div className="text-[7px] text-text-secondary">{day.date}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Timeline
