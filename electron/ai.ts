import fs from 'node:fs'
import path from 'node:path'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { streamText, type ModelMessage } from 'ai'

export type AiModelChoice = 'Auto' | 'Claude' | 'GPT' | 'Gemini'

export type ChatMessageInput = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

function readSystemPrompt(rootDir: string) {
  const promptPath = path.join(rootDir, 'prompts', 'forma-system.md')
  return fs.readFileSync(promptPath, 'utf8')
}

function resolveModel(choice: AiModelChoice) {
  if (choice === 'GPT') {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('Нет OPENAI_API_KEY в .env')
    }
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
    return openai('gpt-4o')
  }

  if (choice === 'Gemini') {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error('Нет GOOGLE_GENERATIVE_AI_API_KEY в .env')
    }
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    })
    return google('gemini-2.0-flash')
  }

  // Auto + Claude
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Нет ANTHROPIC_API_KEY в .env')
  }
  const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  return anthropic('claude-sonnet-4-20250514')
}

export async function streamChatReply(options: {
  rootDir: string
  model: AiModelChoice
  messages: ChatMessageInput[]
  onChunk: (text: string) => void
  signal?: AbortSignal
}) {
  const system = readSystemPrompt(options.rootDir)
  const model = resolveModel(options.model)

  const messages: ModelMessage[] = options.messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({
      role: message.role,
      content: message.content,
    }))

  const result = streamText({
    model,
    system,
    messages,
    abortSignal: options.signal,
  })

  let full = ''
  for await (const chunk of result.textStream) {
    full += chunk
    options.onChunk(chunk)
  }
  return full
}
