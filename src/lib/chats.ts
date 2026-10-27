import { supabase } from '@/lib/supabase'

export type ChatModel = 'Auto' | 'Claude' | 'GPT' | 'Gemini'

export type ChatRow = {
  id: string
  title: string
  folder_id: string
  created_at: string
}

export type FolderRow = {
  id: string
  name: string
  sort: number
}

export type MessageRow = {
  id: string
  chat_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model: string | null
  created_at: string
}

async function requireUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Нужен вход')
  return user.id
}

export async function ensureDefaultFolder(userId: string) {
  const { data: existing, error: selectError } = await supabase
    .from('project_folders')
    .select('id, name, sort')
    .eq('user_id', userId)
    .order('sort', { ascending: true })
    .limit(1)

  if (selectError) throw selectError
  if (existing?.[0]) return existing[0] as FolderRow

  const { data, error } = await supabase
    .from('project_folders')
    .insert({ user_id: userId, name: 'Chats', sort: 0 })
    .select('id, name, sort')
    .single()

  if (error) throw error
  return data as FolderRow
}

export async function listFoldersWithChats() {
  const userId = await requireUserId()

  const [{ data: folders, error: foldersError }, { data: chats, error: chatsError }] =
    await Promise.all([
      supabase
        .from('project_folders')
        .select('id, name, sort')
        .eq('user_id', userId)
        .order('sort', { ascending: true }),
      supabase
        .from('chats')
        .select('id, title, folder_id, created_at')
        .eq('user_id', userId)
        .eq('archived', false)
        .order('created_at', { ascending: false }),
    ])

  if (foldersError) throw foldersError
  if (chatsError) throw chatsError

  return {
    folders: (folders ?? []) as FolderRow[],
    chats: (chats ?? []) as ChatRow[],
  }
}

export async function createChatFromPrompt(text: string, model: ChatModel) {
  const userId = await requireUserId()
  const folder = await ensureDefaultFolder(userId)
  const title = text.trim().slice(0, 48) || 'New chat'

  const { data: chat, error: chatError } = await supabase
    .from('chats')
    .insert({
      user_id: userId,
      folder_id: folder.id,
      title,
    })
    .select('id, title, folder_id, created_at')
    .single()

  if (chatError) throw chatError

  const { data: message, error: messageError } = await supabase
    .from('messages')
    .insert({
      user_id: userId,
      chat_id: chat.id,
      role: 'user',
      content: text.trim(),
      model,
    })
    .select('id, chat_id, role, content, model, created_at')
    .single()

  if (messageError) throw messageError

  return {
    chat: chat as ChatRow,
    message: message as MessageRow,
  }
}

export async function listMessages(chatId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, chat_id, role, content, model, created_at')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data ?? []) as MessageRow[]
}

export async function addMessage(input: {
  chatId: string
  role: 'user' | 'assistant'
  content: string
  model?: ChatModel | null
}) {
  const userId = await requireUserId()
  const { data, error } = await supabase
    .from('messages')
    .insert({
      user_id: userId,
      chat_id: input.chatId,
      role: input.role,
      content: input.content,
      model: input.model ?? null,
    })
    .select('id, chat_id, role, content, model, created_at')
    .single()

  if (error) throw error
  return data as MessageRow
}

export async function getChat(chatId: string) {
  const { data, error } = await supabase
    .from('chats')
    .select('id, title, folder_id, created_at')
    .eq('id', chatId)
    .maybeSingle()

  if (error) throw error
  return data as ChatRow | null
}
