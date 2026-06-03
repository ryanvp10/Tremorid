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
    <div className="bg-bg-secondary border-t border-border px-1.5 pt-1 pb-1 shrink-0 h-auto overflow-visible">
      {/* Header row */}
      <div className="flex items-center justify-between px-0.5 mb-0.5 shrink-0">
        <h2 className="text-[9px] font-semibold leading-none text-text-primary">7-Day Activity</h2>
        {loading && <span className="text-[7px] leading-none text-text-secondary">...</span>}
        {error && <span className="text-[7px] leading-none text-red-500">err</span>}
      </div>

      {/* Single row grid: each cell = count + bar + labels */}
      <div className="grid grid-cols-7 gap-0.5 overflow-visible">
        {dailyCounts.map((day) => {
          const pct = maxCount > 0 ? (day.count / maxCount) * 100 : 0
          const barH = Math.max(pct, 5)

          return (
            <div key={day.key} className="flex h-auto flex-col items-center overflow-visible">
              {/* Count */}
              <span className="shrink-0 text-[8px] font-medium leading-none text-text-primary">{day.count}</span>

              {/* Bar area — compact so the labels always have room */}
              <div className="mt-0.5 h-7 w-full shrink-0 overflow-hidden rounded-sm bg-bg-primary sm:h-8 md:h-9">
                <div
                  className="w-full rounded-sm bg-blue-500"
                  style={{ height: `${barH}%`, marginTop: `${100 - barH}%` }}
                />
              </div>

              {/* Labels — never shrink, so weekday/date text cannot be clipped */}
              <div className="mt-0.5 shrink-0 text-center leading-none overflow-visible">
                <div className="text-[7px] leading-none text-text-secondary">{day.weekday}</div>
                <div className="mt-px text-[7px] leading-none text-text-secondary">{day.date}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Timeline
