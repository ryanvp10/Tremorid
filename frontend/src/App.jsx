import React from 'react'
import Navbar from './components/Navbar'
import Map2D from './components/Map2D'
import QuakeList from './components/QuakeList'
import Timeline from './components/Timeline'

function App() {
  return (
    <div className="flex flex-col h-screen bg-bg-primary">
      <Navbar />
      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <Map2D />
        </div>
        <aside className="w-[360px] bg-bg-secondary border-l border-border overflow-y-auto">
          <QuakeList />
        </aside>
      </main>
      <Timeline />
    </div>
  )
}

export default App
