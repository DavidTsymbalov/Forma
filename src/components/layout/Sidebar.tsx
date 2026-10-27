import { useState } from 'react'
import {
  ChevronDown,
  Code,
  Folder,
  FolderPlus,
  LayoutGrid,
  ListFilter,
  MoreHorizontal,
  Palette,
  PanelLeft,
  Play,
  Settings,
} from 'lucide-react'

import avatarUrl from '../../../assets/icons/avatar-stub.svg'
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
  open: boolean
  active: AppMode
  onChange: (mode: AppMode) => void
  onToggle: () => void
}

export function Sidebar({ open, active, onChange, onToggle }: SidebarProps) {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    idk: true,
  })

  function toggleFolder(id: string) {
    setOpenFolders((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <aside className={cn('sidebar', !open && 'sidebar--collapsed')} aria-hidden={!open}>
      <div className="sidebar-inner">
        <div
          className="app-drag flex shrink-0 items-center"
          style={{ height: 'var(--titlebar-height)', paddingLeft: 'var(--traffic-inset)' }}
        >
          <button
            type="button"
            aria-label="Скрыть боковую панель"
            className="app-no-drag sidebar-icon-btn"
            onClick={onToggle}
          >
            <PanelLeft />
          </button>
        </div>

        <div className="app-no-drag flex min-h-0 flex-1 flex-col gap-3 px-2 pb-2">
          <nav className="flex flex-col gap-0.5">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={cn('sidebar-nav-item', active === id && 'is-active')}
                onClick={() => onChange(id)}
              >
                <Icon />
                {label}
              </button>
            ))}
          </nav>

          <div className="flex min-h-0 flex-1 flex-col gap-1">
            <div className="flex h-7 items-center gap-1 px-1">
              <span className="sidebar-section-title flex-1">Project folders</span>
              <button type="button" className="sidebar-icon-btn" aria-label="Сортировать">
                <ListFilter />
              </button>
              <button type="button" className="sidebar-icon-btn" aria-label="Новая папка">
                <FolderPlus />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
              {folders.map((folder) => {
                const isOpen = Boolean(openFolders[folder.id])
                return (
                  <div key={folder.id}>
                    <div className="sidebar-row group">
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                        onClick={() => toggleFolder(folder.id)}
                      >
                        {isOpen ? <ChevronDown /> : <Folder />}
                        <span className="truncate">{folder.name}</span>
                      </button>
                      <div className="sidebar-row-actions">
                        <button type="button" className="sidebar-icon-btn" aria-label="Открыть">
                          <Play />
                        </button>
                        <button type="button" className="sidebar-icon-btn" aria-label="Ещё">
                          <MoreHorizontal />
                        </button>
                      </div>
                    </div>

                    {isOpen &&
                      folder.chats.map((chat) => (
                        <div key={chat.id} className="sidebar-row sidebar-chat group">
                          <span className="min-w-0 flex-1 truncate">{chat.name}</span>
                          <div className="sidebar-row-actions">
                            <button type="button" className="sidebar-icon-btn" aria-label="Открыть">
                              <Play />
                            </button>
                            <button type="button" className="sidebar-icon-btn" aria-label="Ещё">
                              <MoreHorizontal />
                            </button>
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
              <img src={avatarUrl} alt="" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="profile-name truncate">David Tsymbalov</div>
              <div className="profile-plan truncate">Pro plan</div>
            </div>
            <button type="button" className="sidebar-icon-btn" aria-label="Настройки">
              <Settings />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
