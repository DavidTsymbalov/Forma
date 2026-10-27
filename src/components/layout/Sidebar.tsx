import { useState } from 'react'
import {
  Archive,
  ChevronDown,
  ChevronRight,
  Code,
  Folder,
  FolderPlus,
  LayoutGrid,
  ListFilter,
  Palette,
  PanelLeft,
  Pin,
  Plus,
  Settings,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type AppMode = 'home' | 'code' | 'design'

const navItems = [
  { id: 'home', label: 'Home', icon: LayoutGrid },
  { id: 'code', label: 'Code', icon: Code },
  { id: 'design', label: 'Design', icon: Palette },
] as const

const folders = [
  { id: 'hawk', name: 'Hawk VPN', chats: [] as { id: string; name: string }[] },
  { id: 'ai-slop', name: 'AI slop', chats: [] as { id: string; name: string }[] },
  {
    id: 'idk',
    name: 'IDK',
    chats: [{ id: 'app-to-shop', name: 'App to shop chat' }],
  },
]

type SidebarProps = {
  active: AppMode
  onChange: (mode: AppMode) => void
  onToggle: () => void
}

export function Sidebar({ active, onChange, onToggle }: SidebarProps) {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    idk: true,
  })

  function toggleFolder(id: string) {
    setOpenFolders((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <aside className="sidebar">
      <div className="app-drag flex h-12 shrink-0 items-center justify-end pr-2 pl-20">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Скрыть боковую панель"
          className="app-no-drag"
          onClick={onToggle}
        >
          <PanelLeft />
        </Button>
      </div>

      <div className="app-no-drag flex min-h-0 flex-1 flex-col gap-4 px-3 pb-3">
        <nav className="flex flex-col gap-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={cn('sidebar-nav-item', active === id && 'is-active')}
              onClick={() => onChange(id)}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="flex min-h-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2 px-1">
            <span className="flex-1 text-xs text-text-muted">Project folders</span>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Сортировать">
              <ListFilter className="size-3.5" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Новая папка">
              <FolderPlus className="size-3.5" />
            </Button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
            {folders.map((folder) => {
              const isOpen = Boolean(openFolders[folder.id])
              return (
                <div key={folder.id}>
                  <div className="sidebar-row group">
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      onClick={() => toggleFolder(folder.id)}
                    >
                      {isOpen ? (
                        <ChevronDown className="size-3.5 shrink-0" />
                      ) : (
                        <ChevronRight className="size-3.5 shrink-0" />
                      )}
                      <Folder className="size-3.5 shrink-0" />
                      <span className="truncate">{folder.name}</span>
                    </button>
                    <div className="sidebar-row-actions">
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6" aria-label="Новый чат">
                        <Plus className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  {isOpen &&
                    folder.chats.map((chat) => (
                      <div key={chat.id} className="sidebar-row group pl-7">
                        <span className="min-w-0 flex-1 truncate">{chat.name}</span>
                        <div className="sidebar-row-actions">
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" aria-label="Закрепить">
                            <Pin className="size-3.5" />
                          </Button>
                          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" aria-label="В архив">
                            <Archive className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2 px-1 py-1">
          <div className="avatar" aria-hidden>
            DT
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm text-text-active">David Tsymbalov</div>
            <div className="truncate text-xs text-text-muted">Pro plan</div>
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label="Настройки">
            <Settings className="size-4" />
          </Button>
        </div>
      </div>
    </aside>
  )
}
