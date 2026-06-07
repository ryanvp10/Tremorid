import React, { useState } from 'react'
import { Search, Bell, Menu, Globe } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { API_BASE } from '../services/api'

function Navbar({ onToggleSidebar }) {
  const { lang, toggleLang, t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')

  const onSearch = async () => {
    if (!searchQuery.trim()) return

    const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`)
    const geoData = await geoResponse.json()
    const firstResult = geoData[0]
    if (!firstResult) return

    const { lat, lon } = firstResult
    const response = await fetch(`${API_BASE}/quakes/near?lat=${lat}&lon=${lon}&radius=200`)
    const data = await response.json()
    console.log(data)
  }

  return (
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
            className="pl-10 pr-4 py-2 rounded-lg border border-border bg-bg-primary text-text-primary text-sm w-32 sm:w-48 focus:outline-none focus:border-brand-red"
          />
        </div>

        {/* Language Toggle */}
        <button
          onClick={toggleLang}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg border border-border bg-bg-primary text-text-primary text-xs font-medium hover:bg-bg-secondary transition-colors"
        >
          <Globe size={14} />
          <span>{lang === 'en' ? '🇺🇸 EN' : '🇮🇩 ID'}</span>
        </button>

        <button className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg bg-brand-red text-white text-sm hover:bg-brand-red-dark transition-colors whitespace-nowrap">
          <Bell className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{t('nav.telegram')}</span>
        </button>
      </div>
    </nav>
  )
}

export default Navbar
