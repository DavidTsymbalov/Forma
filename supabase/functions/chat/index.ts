import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

type ModelChoice = 'Auto' | 'Claude' | 'GPT' | 'Gemini'

type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const SYSTEM_PROMPT = `Ты — Forma, ИИ-помощник для больших проектов (дизайн и код).

Главное правило на старте любого нового запроса:
1. Не делай работу сразу.
2. Сначала задай от 2 до 5 коротких уточняющих вопросов — только то, без чего нельзя уверенно начать.
3. Когда пользователь ответил, покажи короткий план по шагам (3–7 пунктов) и явно попроси подтверждение словом «ок».
4. Пока пользователь не сказал «ок» (или близкое согласие: «да», «го», «делай»), не выполняй план и не пиши код/макеты целиком.
5. После «ок» работай по плану, коротко и по делу.

Стиль:
- Пиши по-русски, просто и по-человечески.
- Без воды и без лишней теории.
- Если данных достаточно — не задавай лишних вопросов ради количества.`

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

function resolveOpenRouterModel(choice: ModelChoice) {
  switch (choice) {
    case 'GPT':
      return 'openai/gpt-4o'
    case 'Gemini':
      return 'google/gemini-2.0-flash-001'
    case 'Claude':
    case 'Auto':
    default:
      return 'anthropic/claude-sonnet-4'
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!openRouterKey) {
      return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY is not set' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const chatId = body.chat_id as string | undefined
    const model = (body.model as ModelChoice | undefined) ?? 'Auto'
    const messages = (body.messages as ChatMessage[] | undefined) ?? []

    if (!chatId) {
      return new Response(JSON.stringify({ error: 'chat_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('id')
      .eq('id', chatId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (chatError || !chat) {
      return new Response(JSON.stringify({ error: 'Chat not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const openRouterMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages
        .filter((message) => message.role === 'user' || message.role === 'assistant')
        .map((message) => ({
          role: message.role,
          content: message.content,
        })),
    ]

    const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://forma.app',
        'X-Title': 'Forma',
      },
      body: JSON.stringify({
        model: resolveOpenRouterModel(model),
        messages: openRouterMessages,
        stream: true,
      }),
    })

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text()
      return new Response(JSON.stringify({ error: 'OpenRouter error', detail }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    let buffer = ''

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const reader = upstream.body!.getReader()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed.startsWith('data:')) continue
              const data = trimmed.slice(5).trim()
              if (!data || data === '[DONE]') continue
              try {
                const json = JSON.parse(data)
                const text = json.choices?.[0]?.delta?.content
                if (typeof text === 'string' && text.length > 0) {
                  controller.enqueue(encoder.encode(text))
                }
              } catch {
                // ignore partial JSON
              }
            }
          }
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
