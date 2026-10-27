import { useCallback, useEffect, useMemo, useState } from 'react'
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

import avatarStub from '../../../assets/icons/avatar-stub.svg'
import { useAuth } from '@/auth/AuthProvider'
import { listFoldersWithChats, type ChatRow, type FolderRow } from '@/lib/chats'
import { cn } from '@/lib/utils'

export type AppMode = 'home' | 'code' | 'design' | 'settings' | 'chat'

const navItems = [
  { id: 'home', label: 'Home', icon: LayoutGrid },
  { id: 'code', label: 'Code', icon: Code },
  { id: 'design', label: 'Design', icon: Palette },
] as const

type SidebarProps = {
  open: boolean
  active: AppMode
  activeChatId: string | null
  refreshKey: number
  onChange: (mode: AppMode) => void
  onOpenChat: (chat: ChatRow) => void
  onToggle: () => void
}

export function Sidebar({
  open,
  active,
  activeChatId,
  refreshKey,
  onChange,
  onOpenChat,
  onToggle,
}: SidebarProps) {
  const { user, profile } = useAuth()
  const [folders, setFolders] = useState<FolderRow[]>([])
  const [chats, setChats] = useState<ChatRow[]>([])
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({})

  const displayName = profile?.name || user?.email?.split('@')[0] || 'User'
  const email = user?.email || ''
  const avatarSrc = profile?.avatar_url || avatarStub

  const refresh = useCallback(async () => {
    try {
      const data = await listFoldersWithChats()
      setFolders(data.folders)
      setChats(data.chats)
      setOpenFolders((prev) => {
        const next = { ...prev }
        for (const folder of data.folders) {
          if (next[folder.id] === undefined) next[folder.id] = true
        }
        return next
      })
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh, refreshKey, user?.id])

  const chatsByFolder = useMemo(() => {
    const map = new Map<string, ChatRow[]>()
    for (const chat of chats) {
      const list = map.get(chat.folder_id) ?? []
      list.push(chat)
      map.set(chat.folder_id, list)
    }
    return map
  }, [chats])

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
              {folders.length === 0 ? (
                <div className="px-2 py-1 text-xs text-text-muted">Папок пока нет</div>
              ) : null}

              {folders.map((folder) => {
                const isOpen = Boolean(openFolders[folder.id])
                const folderChats = chatsByFolder.get(folder.id) ?? []
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
                      folderChats.map((chat) => (
                        <button
                          key={chat.id}
                          type="button"
                          className={cn(
                            'sidebar-row sidebar-chat group w-full text-left',
                            activeChatId === chat.id && 'is-active-chat',
                          )}
                          onClick={() => onOpenChat(chat)}
                        >
                          <span className="min-w-0 flex-1 truncate">{chat.title}</span>
                          <div className="sidebar-row-actions">
                            <span className="sidebar-icon-btn" aria-hidden>
                              <Play />
                            </span>
                            <span className="sidebar-icon-btn" aria-hidden>
                              <MoreHorizontal />
                            </span>
                          </div>
                        </button>
                      ))}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-auto flex items-center gap-2 px-1 py-1">
            <div className="avatar" aria-hidden>
              <img src={avatarSrc} alt="" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="profile-name truncate">{displayName}</div>
              <div className="profile-plan truncate">{email}</div>
            </div>
            <button
              type="button"
              className="sidebar-icon-btn"
              aria-label="Настройки"
              onClick={() => onChange('settings')}
            >
              <Settings />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
