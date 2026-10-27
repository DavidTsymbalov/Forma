import { useState } from 'react'
import { ChevronDown, Laptop, PanelLeft, PanelRight } from 'lucide-react'

import logoUrl from '../../assets/icons/forma-logo.svg'
import { PromptInput } from '@/components/PromptInput'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const PROJECT_OPTIONS = ['New project', 'Blank project', 'From template'] as const
const MACHINE_OPTIONS = ['This Mac', 'Cloud'] as const

type HomeScreenProps = {
  active: boolean
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function HomeScreen({ active, sidebarOpen, onToggleSidebar }: HomeScreenProps) {
  const [projectLabel, setProjectLabel] = useState<string>('New project')
  const [machineLabel, setMachineLabel] = useState<(typeof MACHINE_OPTIONS)[number]>('This Mac')

  return (
    <section className={active ? 'screen-pane is-active' : 'screen-pane'} aria-hidden={!active}>
      <header
        className="app-drag flex shrink-0 items-center justify-between gap-3 px-3"
        style={{ height: 'var(--titlebar-height)' }}
      >
        <div className="flex items-center">
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
        </div>

        <div className="app-no-drag flex items-center gap-2">
          <img src={logoUrl} alt="" className="h-5 w-5" />
          <span className="text-sm font-semibold tracking-wide text-text-active">Forma</span>
          <button type="button" className="sidebar-icon-btn" aria-label="Правая панель">
            <PanelRight />
          </button>
        </div>
      </header>

      <div className="app-no-drag flex min-h-0 flex-1 flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <div className="home-prompt-column">
            <div className="home-prompt-row">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="menu-trigger">
                    {projectLabel}
                    <ChevronDown className="size-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={2}>
                  {PROJECT_OPTIONS.filter((item) => item !== 'New project').map((item) => (
                    <DropdownMenuItem key={item} onSelect={() => setProjectLabel(item)}>
                      {item}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="menu-trigger">
                    <Laptop className="size-3" />
                    {machineLabel}
                    <ChevronDown className="size-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={2}>
                  {MACHINE_OPTIONS.map((item) => (
                    <DropdownMenuItem key={item} onSelect={() => setMachineLabel(item)}>
                      {item}
                    </DropdownMenuItem>
                  ))}
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

        <p className="home-hint">
          Hint: write more information to the AI in the prompt so that it does a better job
        </p>
      </div>
    </section>
  )
}
