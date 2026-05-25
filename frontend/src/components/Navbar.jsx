import React from 'react'
import { Search, Bell } from 'lucide-react'

function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-bg-secondary border-b border-border h-14 shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🌍</span>
        <h1 className="text-xl font-bold text-brand-red">TremorID</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            placeholder="Cari kota..."
            className="pl-10 pr-4 py-2 rounded-lg border border-border bg-bg-primary text-text-primary text-sm w-48 focus:outline-none focus:border-brand-red"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-red text-white text-sm hover:bg-brand-red-dark transition-colors">
          <Bell className="w-4 h-4" />
          Telegram
        </button>
      </div>
    </nav>
  )
}

export default Navbar
