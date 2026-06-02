import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Map3D from './components/Map3D'
import QuakeList from './components/QuakeList'
import FilterPanel from './components/FilterPanel'
import Timeline from './components/Timeline'

function App() {
  const [filters, setFilters] = useState({})
  return (
    <div className="flex flex-col h-screen bg-bg-primary">
      <Navbar />
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <Map3D />
        </div>
        <aside className="w-[360px] bg-bg-secondary border-l border-border overflow-y-auto">
          <FilterPanel onFiltersChange={setFilters} />
          <QuakeList filters={filters} />
        </aside>
      </main>
      <Timeline />
    </div>
  )
}

export default App
