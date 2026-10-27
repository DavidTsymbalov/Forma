import { PanelLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'

type ModeScreenProps = {
  title: string
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function ModeScreen({ title, sidebarOpen, onToggleSidebar }: ModeScreenProps) {
  return (
    <main className="flex h-full min-w-0 flex-1 flex-col bg-bg">
      <header className="app-drag flex h-12 shrink-0 items-center px-3">
        {!sidebarOpen && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Показать боковую панель"
            className="app-no-drag ml-16"
            onClick={onToggleSidebar}
          >
            <PanelLeft />
          </Button>
        )}
      </header>
      <div className="app-no-drag flex flex-1 flex-col gap-2 p-8">
        <h1 className="text-2xl font-semibold text-text-active">{title}</h1>
      </div>
    </main>
  )
}
