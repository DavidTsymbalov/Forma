import { useState } from 'react'

import { useAuth } from '@/auth/AuthProvider'
import { ChatScreen } from '@/components/ChatScreen'
import { HomeScreen } from '@/components/HomeScreen'
import { ModeScreen } from '@/components/ModeScreen'
import { SettingsScreen } from '@/components/SettingsScreen'
import { SignInScreen } from '@/components/SignInScreen'
import type { PromptModel } from '@/components/PromptInput'
import { Sidebar, type AppMode } from '@/components/layout/Sidebar'
import { createChatFromPrompt, type ChatRow } from '@/lib/chats'

type OpenChat = {
  chat: ChatRow
  model: PromptModel
  autoStart: boolean
}

export default function App() {
  const { ready, session } = useAuth()
  const [mode, setMode] = useState<AppMode>('home')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [openChat, setOpenChat] = useState<OpenChat | null>(null)
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0)

  function toggleSidebar() {
    setSidebarOpen((open) => !open)
  }

  async function startChat(text: string, model: PromptModel) {
    const { chat } = await createChatFromPrompt(text, model)
    setOpenChat({ chat, model, autoStart: true })
    setMode('chat')
    setSidebarRefreshKey((value) => value + 1)
  }

  function openExistingChat(chat: ChatRow) {
    setOpenChat({ chat, model: 'Auto', autoStart: false })
    setMode('chat')
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
      <Sidebar
        open={sidebarOpen}
        active={mode}
        activeChatId={openChat?.chat.id ?? null}
        refreshKey={sidebarRefreshKey}
        onChange={setMode}
        onOpenChat={openExistingChat}
        onToggle={toggleSidebar}
      />

      <div className="main-stage">
        <HomeScreen
          active={mode === 'home'}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
          onStartChat={startChat}
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
        {openChat ? (
          <ChatScreen
            key={openChat.chat.id}
            active={mode === 'chat'}
            chatId={openChat.chat.id}
            title={openChat.chat.title}
            initialModel={openChat.model}
            autoStart={openChat.autoStart}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={toggleSidebar}
          />
        ) : null}
      </div>
    </div>
  )
}
