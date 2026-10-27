import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowUp, ChevronDown, Plus } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export const PROMPT_MODELS = ['Auto', 'Claude', 'GPT', 'Gemini'] as const
export type PromptModel = (typeof PROMPT_MODELS)[number]

type PromptInputProps = {
  placeholder?: string
  centered?: boolean
  disabled?: boolean
  model?: PromptModel
  onModelChange?: (model: PromptModel) => void
  onSubmit?: (text: string, model: PromptModel) => void | Promise<void>
}

export function PromptInput({
  placeholder = 'Опиши, что сделать…',
  centered = false,
  disabled = false,
  model: controlledModel,
  onModelChange,
  onSubmit,
}: PromptInputProps) {
  const [value, setValue] = useState('')
  const [uncontrolledModel, setUncontrolledModel] = useState<PromptModel>('Auto')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const model = controlledModel ?? uncontrolledModel
  const canSend = !disabled && value.trim().length > 0

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  function setModel(next: PromptModel) {
    onModelChange?.(next)
    if (controlledModel === undefined) {
      setUncontrolledModel(next)
    }
  }

  async function send() {
    const text = value.trim()
    if (!text || disabled) return
    setValue('')
    await onSubmit?.(text, model)
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void send()
    }
  }

  return (
    <div className={cn('prompt-shell', centered && 'prompt-shell--center')}>
      <div className="prompt-card">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={disabled}
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
                <button type="button" className="prompt-model" disabled={disabled}>
                  {model}
                  <ChevronDown className="size-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {PROMPT_MODELS.map((item) => (
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
            onClick={() => void send()}
            className={cn('prompt-send', canSend && 'is-ready')}
          >
            <ArrowUp className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
