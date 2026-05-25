import { useState, useEffect, useCallback } from 'react'
import { quakeService } from '../services/api'

export function useQuakes(refreshInterval = 15000) {
  const [quakes, setQuakes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchQuakes = useCallback(async () => {
    try {
      const { data } = await quakeService.getAll()
      setQuakes(data)
      setLastUpdated(new Date())
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuakes()
    const interval = setInterval(fetchQuakes, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchQuakes, refreshInterval])

  return { quakes, loading, error, lastUpdated, refetch: fetchQuakes }
}
