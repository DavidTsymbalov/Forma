import { PanelLeft } from 'lucide-react'

import { useAuth } from '@/auth/AuthProvider'

type SettingsScreenProps = {
  active: boolean
  sidebarOpen: boolean
  onToggleSidebar: () => void
  onClose: () => void
}

export function SettingsScreen({
  active,
  sidebarOpen,
  onToggleSidebar,
  onClose,
}: SettingsScreenProps) {
  const { user, profile, signOut } = useAuth()

  return (
    <section className={active ? 'screen-pane is-active' : 'screen-pane'} aria-hidden={!active}>
      <header
        className="app-drag flex shrink-0 items-center justify-between px-3"
        style={{ height: 'var(--titlebar-height)' }}
      >
        <div>
          {!sidebarOpen && (
            <button
              type="button"
              aria-label="Показать боковую панель"
              className="app-no-drag sidebar-icon-btn"
              style={{ marginLeft: 'var(--traffic-inset)' }}
              onClick={onToggleSidebar}
            >
              <PanelLeft />
            </button>
          )}
        </div>
        <button type="button" className="app-no-drag signin-link px-3" onClick={onClose}>
          Закрыть
        </button>
      </header>

      <div className="app-no-drag flex flex-1 items-start justify-center p-8">
        <div className="settings-panel">
          <h1 className="text-xl font-semibold text-text-active">Settings</h1>
          <div className="text-sm text-text-muted">
            <div>{profile?.name || 'Без имени'}</div>
            <div>{user?.email}</div>
          </div>
          <button
            type="button"
            className="settings-logout"
            onClick={() => {
              void signOut()
            }}
          >
            Выйти
          </button>
        </div>
      </div>
    </section>
  )
}
