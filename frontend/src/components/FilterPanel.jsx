import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

function FilterPanel({ onFiltersChange }) {
  const { t } = useLanguage()
  const [minMag, setMinMag] = useState('')
  const [maxMag, setMaxMag] = useState('')
  const [maxDepth, setMaxDepth] = useState('')

  const handleApply = () => {
    onFiltersChange({ minMag, maxMag, maxDepth })
  }

  const handleReset = () => {
    setMinMag('')
    setMaxMag('')
    setMaxDepth('')
    onFiltersChange({})
  }

  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-4 w-full max-w-xs">
      <h2 className="text-text-primary text-lg font-semibold mb-4">{t('filter.title')}</h2>

      {/* Magnitude Range */}
      <div className="mb-4">
        <label className="text-text-primary text-sm font-medium block mb-1">
          {t('filter.magnitude')}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            placeholder={t('filter.minMag')}
            value={minMag}
            onChange={(e) => setMinMag(e.target.value)}
            className="w-full bg-bg-primary border border-border text-text-primary text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-text-primary text-sm">–</span>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            placeholder={t('filter.maxMag')}
            value={maxMag}
            onChange={(e) => setMaxMag(e.target.value)}
            className="w-full bg-bg-primary border border-border text-text-primary text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Max Depth */}
      <div className="mb-4">
        <label className="text-text-primary text-sm font-medium block mb-1">
          {t('filter.depth')}
        </label>
        <input
          type="number"
          min="0"
          max="700"
          step="1"
          placeholder="0–700"
          value={maxDepth}
          onChange={(e) => setMaxDepth(e.target.value)}
          className="w-full bg-bg-primary border border-border text-text-primary text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleApply}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded px-3 py-1.5 transition-colors"
        >
          {t('filter.apply')}
        </button>
        <button
          onClick={handleReset}
          className="flex-1 bg-bg-primary hover:bg-gray-600 text-text-primary border border-border text-sm font-medium rounded px-3 py-1.5 transition-colors"
        >
          {t('filter.reset')}
        </button>
      </div>
    </div>
  )
}

export default FilterPanel
