import { PanelLeft } from 'lucide-react'

type ModeScreenProps = {
  title: string
  active: boolean
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function ModeScreen({ title, active, sidebarOpen, onToggleSidebar }: ModeScreenProps) {
  return (
    <section className={active ? 'screen-pane is-active' : 'screen-pane'} aria-hidden={!active}>
      <header
        className="app-drag flex shrink-0 items-center px-3"
        style={{ height: 'var(--titlebar-height)' }}
      >
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
      </header>
      <div className="app-no-drag flex min-h-0 flex-1">
        <h1 className="mode-title">{title}</h1>
      </div>
    </section>
  )
}
