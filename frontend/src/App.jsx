import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Map3D from './components/Map3D'
import ErrorBoundary from './components/ErrorBoundary'
import QuakeList from './components/QuakeList'
import FilterPanel from './components/FilterPanel'
import Timeline from './components/Timeline'

import { LanguageProvider } from './contexts/LanguageContext'

function App() {
  const [filters, setFilters] = useState({})
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <LanguageProvider>
    <div className="flex flex-col h-screen overflow-hidden bg-bg-primary" style={{ height: '100dvh' }}>
      <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
      <main className={`flex flex-1 overflow-hidden relative ${sidebarOpen ? 'md:overflow-hidden' : ''}`}>
        <div className={`flex-1 relative ${sidebarOpen ? 'pointer-events-none md:pointer-events-auto' : ''}`}>
          <ErrorBoundary>
            <Map3D />
          </ErrorBoundary>
        </div>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{ touchAction: 'none' }}
          />
        )}

        {/* Sidebar — slides from left on mobile, right on desktop */}
        <aside className={`
          fixed md:static top-0 left-0 md:left-auto md:right-0
          h-[calc(100vh-theme(spacing.12))] md:h-full
          w-[85vw] max-w-[360px] md:w-[360px]
          bg-bg-secondary border-r md:border-r-0 md:border-l border-border
          overflow-y-auto z-50 md:z-auto shrink-0
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <FilterPanel onFiltersChange={setFilters} />
          <QuakeList filters={filters} />
        </aside>
      </main>
      <Timeline />
    </div>
    </LanguageProvider>
  )
}

export default App
