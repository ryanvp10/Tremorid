import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Map3D from './components/Map3D'
import QuakeList from './components/QuakeList'
import FilterPanel from './components/FilterPanel'
import Timeline from './components/Timeline'

function App() {
  const [filters, setFilters] = useState({})
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-bg-primary">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <main className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 relative">
          <Map3D />
        </div>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed md:static top-0 right-0 h-full md:h-auto
          w-[85vw] max-w-[360px] md:w-[360px]
          bg-bg-secondary border-l border-border
          overflow-y-auto z-50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}>
          <FilterPanel onFiltersChange={setFilters} />
          <QuakeList filters={filters} />
        </aside>
      </main>
      <Timeline />
    </div>
  )
}

export default App
