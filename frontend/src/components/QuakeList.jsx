import React, { useEffect, useState } from 'react'
import QuakeCard from './QuakeCard'

function QuakeList() {
  const [quakes, setQuakes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function fetchQuakes() {
      try {
        const response = await fetch('http://localhost:3000/api/quakes')

        if (!response.ok) {
          throw new Error('Failed to fetch earthquakes')
        }

        const data = await response.json()

        if (isMounted) {
          setQuakes(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch earthquakes')
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

  return (
    <section className="min-h-full bg-bg-secondary p-4 text-text-primary">
      <h2 className="mb-4 text-base font-semibold">📊 Gempa Terkini</h2>

      {loading && (
        <p className="text-sm text-text-secondary">Loading earthquakes...</p>
      )}

      {!loading && error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {!loading && !error && quakes.length === 0 && (
        <p className="text-sm text-text-secondary">No earthquakes found</p>
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
