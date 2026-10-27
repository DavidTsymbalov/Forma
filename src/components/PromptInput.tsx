import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowUp, ChevronDown, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
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

        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="ghost" size="icon" aria-label="Добавить вложение" className="shrink-0">
            <Plus />
          </Button>

          <div className="flex min-w-0 shrink-0 items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="gap-1 text-text-muted">
                  {model}
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {MODELS.map((item) => (
                  <DropdownMenuItem key={item} onSelect={() => setModel(item)}>
                    {item}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              type="button"
              aria-label="Отправить"
              disabled={!canSend}
              onClick={send}
              className={cn('prompt-send', canSend && 'is-ready')}
            >
              <ArrowUp className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
