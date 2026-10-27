import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowUp, ChevronDown, Plus } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const MODELS = ['Auto', 'Claude', 'GPT', 'Gemini'] as const

type Model = (typeof MODELS)[number]

type PromptInputProps = {
  placeholder?: string
  centered?: boolean
}

export function PromptInput({
  placeholder = 'Опиши, что сделать…',
  centered = false,
}: PromptInputProps) {
  const [value, setValue] = useState('')
  const [model, setModel] = useState<Model>('Auto')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const canSend = value.trim().length > 0

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  function send() {
    const text = value.trim()
    if (!text) return
    console.log({ text, model })
    setValue('')
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      send()
    }
  }

  return (
    <div className={cn('prompt-shell', centered && 'prompt-shell--center')}>
      <div className="prompt-card">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="prompt-textarea"
        />

        <div className="prompt-toolbar">
          <div className="prompt-toolbar-left">
            <button type="button" className="prompt-attach" aria-label="Добавить вложение">
              <Plus className="size-3.5" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="prompt-model">
                  {model}
                  <ChevronDown className="size-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {MODELS.map((item) => (
                  <DropdownMenuItem key={item} onSelect={() => setModel(item)}>
                    {item}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <button
            type="button"
            aria-label="Отправить"
            disabled={!canSend}
            onClick={send}
            className={cn('prompt-send', canSend && 'is-ready')}
          >
            <ArrowUp className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
