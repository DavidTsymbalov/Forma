import { useEffect, useRef, useState } from 'react'
import { PanelLeft } from 'lucide-react'

import { PromptInput, type PromptModel } from '@/components/PromptInput'
import { streamChatFromEdge } from '@/lib/ai-stream'
import { addMessage, listMessages, type MessageRow } from '@/lib/chats'
import { cn } from '@/lib/utils'

type ChatScreenProps = {
  active: boolean
  chatId: string
  title: string
  initialModel: PromptModel
  sidebarOpen: boolean
  onToggleSidebar: () => void
  autoStart?: boolean
}

type UiMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
}

function toUiMessages(rows: MessageRow[]): UiMessage[] {
  return rows.flatMap((row) => {
    if (row.role !== 'user' && row.role !== 'assistant') return []
    return [
      {
        id: row.id,
        role: row.role,
        content: row.content,
      },
    ]
  })
}

export function ChatScreen({
  active,
  chatId,
  title,
  initialModel,
  sidebarOpen,
  onToggleSidebar,
  autoStart = false,
}: ChatScreenProps) {
  const [messages, setMessages] = useState<UiMessage[]>([])
  const [model, setModel] = useState<PromptModel>(initialModel)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const startedRef = useRef<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, busy])

  useEffect(() => {
    let cancelled = false
    setLoaded(false)
    setMessages([])
    setError(null)

    async function load() {
      try {
        const rows = await listMessages(chatId)
        if (cancelled) return
        setMessages(toUiMessages(rows))
        setLoaded(true)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Не удалось загрузить чат')
          setLoaded(true)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
      abortRef.current?.abort()
    }
  }, [chatId])

  async function runAssistant(nextMessages: UiMessage[], nextModel: PromptModel) {
    const assistantId = `local-${crypto.randomUUID()}`
    const controller = new AbortController()
    abortRef.current = controller

    setBusy(true)
    setError(null)
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', streaming: true },
    ])

    try {
      const text = await streamChatFromEdge({
        chatId,
        model: nextModel,
        messages: nextMessages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        signal: controller.signal,
        onChunk: (chunk) => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? { ...message, content: `${message.content}${chunk}` }
                : message,
            ),
          )
        },
      })

      const saved = await addMessage({
        chatId,
        role: 'assistant',
        content: text,
        model: nextModel,
      })

      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantId
            ? {
                id: saved.id,
                role: 'assistant',
                content: saved.content,
              }
            : message,
        ),
      )
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Ошибка ИИ')
      setMessages((prev) => prev.filter((message) => message.id !== assistantId))
    } finally {
      setBusy(false)
      abortRef.current = null
    }
  }

  useEffect(() => {
    if (!active || !autoStart || !loaded) return
    if (startedRef.current === chatId) return
    if (busy) return

    const hasAssistant = messages.some((message) => message.role === 'assistant')
    const userMessages = messages.filter((message) => message.role === 'user')
    if (hasAssistant || userMessages.length === 0) {
      startedRef.current = chatId
      return
    }

    startedRef.current = chatId
    void runAssistant(messages, initialModel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, autoStart, loaded, chatId, messages, initialModel, busy])

  async function onSubmit(text: string, nextModel: PromptModel) {
    if (busy) return
    setModel(nextModel)

    const saved = await addMessage({
      chatId,
      role: 'user',
      content: text,
      model: nextModel,
    })

    const nextMessages: UiMessage[] = [
      ...messages.filter((message) => !message.streaming),
      { id: saved.id, role: 'user', content: saved.content },
    ]
    setMessages(nextMessages)
    await runAssistant(nextMessages, nextModel)
  }

  return (
    <section className={active ? 'screen-pane is-active' : 'screen-pane'} aria-hidden={!active}>
      <header
        className="app-drag flex shrink-0 items-center gap-3 px-3"
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
        <div className="app-no-drag truncate text-sm text-text-active">{title}</div>
      </header>

      <div className="app-no-drag flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="chat-thread">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'chat-bubble',
                  message.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant',
                )}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                {message.streaming && !message.content ? (
                  <div className="text-xs text-text-muted">Думаю…</div>
                ) : null}
              </div>
            ))}
            {error ? <div className="text-sm text-text-muted">{error}</div> : null}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="shrink-0 pb-4">
          <PromptInput
            centered
            disabled={busy}
            model={model}
            onModelChange={setModel}
            onSubmit={(text, nextModel) => {
              void onSubmit(text, nextModel)
            }}
            placeholder={busy ? 'Подожди ответ…' : 'Ответь или уточни…'}
          />
        </div>
      </div>
    </section>
  )
}
