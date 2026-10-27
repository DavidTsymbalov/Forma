import { ChevronDown, Laptop, PanelLeft, PanelRight } from 'lucide-react'

import logoUrl from '../../assets/icons/forma-logo.svg'
import { PromptInput } from '@/components/PromptInput'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type HomeScreenProps = {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function HomeScreen({ sidebarOpen, onToggleSidebar }: HomeScreenProps) {
  return (
    <main className="flex h-full min-w-0 flex-1 flex-col bg-bg">
      <header className="app-drag flex h-12 shrink-0 items-center justify-between gap-3 px-3">
        <div className="flex items-center gap-1">
          {!sidebarOpen && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Показать боковую панель"
              className="app-no-drag ml-16"
              onClick={onToggleSidebar}
            >
              <PanelLeft />
            </Button>
          )}
        </div>

        <div className="app-no-drag flex items-center gap-2">
          <img src={logoUrl} alt="" className="h-5 w-5" />
          <span className="text-sm font-semibold tracking-wide text-text-active">Forma</span>
          <Button type="button" variant="ghost" size="icon" aria-label="Правая панель">
            <PanelRight />
          </Button>
        </div>
      </header>

      <div className="app-no-drag flex min-h-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <div className="home-prompt-column">
            <div className="home-prompt-row">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="sm" className="gap-1 text-text-muted">
                    New project
                    <ChevronDown className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>Blank project</DropdownMenuItem>
                  <DropdownMenuItem>From template</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="sm" className="gap-1 text-text-muted">
                    <Laptop className="size-3.5" />
                    This Mac
                    <ChevronDown className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>This Mac</DropdownMenuItem>
                  <DropdownMenuItem>Cloud</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <PromptInput
              centered
              placeholder="Plans, websites, projects — build anything with one message"
            />

            <div className="home-prompt-row">
              <button type="button" className="chip-button">
                MultiTask
              </button>
              <button type="button" className="chip-button">
                Build new idea
              </button>
            </div>
          </div>
        </div>

        <p className="shrink-0 px-6 pb-6 text-center text-xs text-text-muted">
          Hint: write more information to the AI in the prompt so that it does a better job
        </p>
      </div>
    </main>
  )
}
