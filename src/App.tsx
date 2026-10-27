import { useState } from 'react'

import { HomeScreen } from '@/components/HomeScreen'
import { ModeScreen } from '@/components/ModeScreen'
import { Sidebar, type AppMode } from '@/components/layout/Sidebar'

export default function App() {
  const [mode, setMode] = useState<AppMode>('home')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  function toggleSidebar() {
    setSidebarOpen((open) => !open)
  }

  return (
    <div className="flex h-full w-full overflow-hidden">
      {sidebarOpen && <Sidebar active={mode} onChange={setMode} onToggle={toggleSidebar} />}

      {mode === 'home' && (
        <HomeScreen sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
      )}
      {mode === 'code' && (
        <ModeScreen title="Code" sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
      )}
      {mode === 'design' && (
        <ModeScreen title="Design" sidebarOpen={sidebarOpen} onToggleSidebar={toggleSidebar} />
      )}
    </div>
  )
}
