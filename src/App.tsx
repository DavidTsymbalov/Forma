import { useState } from 'react'

import { useAuth } from '@/auth/AuthProvider'
import { HomeScreen } from '@/components/HomeScreen'
import { ModeScreen } from '@/components/ModeScreen'
import { SettingsScreen } from '@/components/SettingsScreen'
import { SignInScreen } from '@/components/SignInScreen'
import { Sidebar, type AppMode } from '@/components/layout/Sidebar'

export default function App() {
  const { ready, session } = useAuth()
  const [mode, setMode] = useState<AppMode>('home')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  function toggleSidebar() {
    setSidebarOpen((open) => !open)
  }

  if (!ready) {
    return (
      <div className="app-frame">
        <div className="flex h-full w-full items-center justify-center bg-bg text-sm text-text-muted">
          Загрузка…
        </div>
      </div>
    )
  }

  if (!session) {
    return <SignInScreen />
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
        <SettingsScreen
          active={mode === 'settings'}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
          onClose={() => setMode('home')}
        />
      </div>
    </div>
  )
}
