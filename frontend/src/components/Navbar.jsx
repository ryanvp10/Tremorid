import React, { useEffect, useState } from 'react'
import { Search, Bell, Menu, Globe, X } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { API_BASE } from '../services/api'

function Navbar({ onToggleSidebar, onSearchResults }) {
  const { lang, toggleLang, t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false)

  useEffect(() => {
    if (!isTelegramModalOpen) return

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsTelegramModalOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isTelegramModalOpen])

  const onSearch = async () => {
    if (!searchQuery.trim()) return

    const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`)
    const geoData = await geoResponse.json()
    const firstResult = geoData[0]
    if (!firstResult) return

    const { lat, lon } = firstResult
    const response = await fetch(`${API_BASE}/quakes/near?lat=${lat}&lon=${lon}&radius=200`)
    const data = await response.json()
    setHasSearched(true)
    onSearchResults?.(data, { lat: parseFloat(lat), lon: parseFloat(lon) })
  }

  const onClearSearch = () => {
    setSearchQuery('')
    setHasSearched(false)
    onSearchResults?.(null, null)
  }

  return (
    <>
    <nav className="flex items-center justify-between px-4 md:px-6 py-3 bg-bg-secondary border-b border-border h-14 shrink-0">
      <div className="flex items-center gap-2">
        <button className="md:hidden p-1 -ml-1" onClick={onToggleSidebar}>
          <Menu size={24} className="text-text-primary" />
        </button>
        <span className="text-2xl">🌍</span>
        <h1 className="text-xl font-bold text-brand-red">TremorID</h1>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder={t('nav.searchPlaceholder')}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') onSearch()
            }}
            className="pl-10 pr-8 py-2 rounded-lg border border-border bg-bg-primary text-text-primary text-sm w-32 sm:w-48 focus:outline-none focus:border-brand-red"
          />
          {hasSearched && (
            <button
              onClick={onClearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Language Toggle */}
        <button
          onClick={toggleLang}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-border bg-bg-primary text-text-primary text-xs font-medium hover:bg-bg-secondary transition-colors"
        >
          <Globe size={14} />
          <span>{lang === 'en' ? '🇺🇸 EN' : '🇮🇩 ID'}</span>
        </button>

        <button
          onClick={() => setIsTelegramModalOpen(true)}
          className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg bg-brand-red text-white text-sm hover:bg-brand-red-dark transition-colors whitespace-nowrap"
        >
          <Bell className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{t('nav.telegram')}</span>
        </button>
      </div>
    </nav>

    {isTelegramModalOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={() => setIsTelegramModalOpen(false)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="telegram-modal-title"
      >
        <div
          className="relative w-full max-w-sm rounded-2xl border border-border bg-bg-primary p-6 text-text-primary shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            onClick={() => setIsTelegramModalOpen(false)}
            className="absolute right-3 top-3 rounded-lg p-1.5 text-text-secondary hover:bg-bg-secondary hover:text-text-primary transition-colors"
            aria-label={t('modal.telegram.close')}
          >
            <X className="h-5 w-5" />
          </button>

          <div className="mb-4 flex items-center gap-3 pr-8">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-red text-white">
              <Bell className="h-5 w-5" />
            </div>
            <h2 id="telegram-modal-title" className="text-xl font-bold">
              {t('modal.telegram.title')}
            </h2>
          </div>

          <p className="mb-5 text-sm leading-6 text-text-secondary">
            {t('modal.telegram.desc')}
          </p>

          <ol className="mb-6 space-y-3 text-sm text-text-primary">
            {[1, 2, 3].map((step) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-bg-secondary text-xs font-semibold text-brand-red">
                  {step}
                </span>
                <span className="leading-6">{t(`modal.telegram.step${step}`)}</span>
              </li>
            ))}
          </ol>

          <a
            href="https://t.me/TremorIDBot"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-lg bg-brand-red px-4 py-3 text-center text-sm font-semibold text-white hover:bg-brand-red-dark transition-colors"
          >
            {t('modal.telegram.openButton')}
          </a>
        </div>
      </div>
    )}
    </>
  )
}

export default Navbar
