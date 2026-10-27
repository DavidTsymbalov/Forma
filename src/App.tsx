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
    <div className="app-frame">
      <Sidebar open={sidebarOpen} active={mode} onChange={setMode} onToggle={toggleSidebar} />

      <div className="main-stage">
        <HomeScreen
          active={mode === 'home'}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
        />
        <ModeScreen
          title="Code"
          active={mode === 'code'}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
        />
        <ModeScreen
          title="Design"
          active={mode === 'design'}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
        />
      </div>
    </div>
  )
}
