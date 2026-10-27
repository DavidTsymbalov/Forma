import { supabase } from '@/lib/supabase'
import type { PromptModel } from '@/components/PromptInput'

type StreamMessage = {
  role: 'user' | 'assistant'
  content: string
}

export async function streamChatFromEdge(options: {
  chatId: string
  model: PromptModel
  messages: StreamMessage[]
  onChunk: (text: string) => void
  signal?: AbortSignal
}) {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error('Нужен вход')
  }

  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Нет Supabase URL/key')
  }

  const response = await fetch(`${url}/functions/v1/chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: options.chatId,
      model: options.model,
      messages: options.messages,
    }),
    signal: options.signal,
  })

  if (!response.ok) {
    let detail = `HTTP ${response.status}`
    const raw = await response.text()
    try {
      const json = JSON.parse(raw) as { error?: string; detail?: string }
      detail = json.error || json.detail || detail
    } catch {
      if (raw) detail = raw
    }
    throw new Error(detail)
  }

  if (!response.body) {
    throw new Error('Пустой ответ от Edge Function')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let full = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    if (!chunk) continue
    full += chunk
    options.onChunk(chunk)
  }

  return full
}
