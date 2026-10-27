import { LayoutTemplate, Code2 } from 'lucide-react'

import logoUrl from '../../../assets/icons/forma-logo.svg'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navItems = [
  { id: 'design', label: 'Design', icon: LayoutTemplate },
  { id: 'it', label: 'IT', icon: Code2 },
] as const

type SidebarProps = {
  active: (typeof navItems)[number]['id']
  onChange: (id: (typeof navItems)[number]['id']) => void
}

export function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <aside className="flex h-full w-60 flex-col bg-sidebar text-text-active">
      <div className="app-drag flex h-12 items-center gap-2 pl-20 pr-4">
        <img src={logoUrl} alt="Forma" className="app-no-drag h-5 w-5" />
        <span className="app-no-drag text-sm font-semibold tracking-wide">Forma</span>
      </div>

      <nav className="app-no-drag flex flex-1 flex-col gap-1 px-3 py-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant="ghost"
            className={cn(
              'w-full justify-start gap-2',
              active === id && 'bg-input-bg text-text-active',
            )}
            onClick={() => onChange(id)}
          >
            <Icon />
            {label}
          </Button>
        ))}
      </nav>
    </aside>
  )
}
