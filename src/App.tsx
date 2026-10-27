import { useState } from 'react'

import { MainArea } from '@/components/layout/MainArea'
import { Sidebar } from '@/components/layout/Sidebar'

const copy = {
  design: {
    title: 'Design',
    description: 'Режим дизайна — как Figma. Здесь будет холст и инструменты.',
  },
  it: {
    title: 'IT',
    description: 'Режим кода — проекты, файлы и ИИ-помощь рядом.',
  },
} as const

export default function App() {
  const [mode, setMode] = useState<'design' | 'it'>('design')

  return (
    <div className="flex h-full w-full overflow-hidden">
      <Sidebar active={mode} onChange={setMode} />
      <MainArea title={copy[mode].title} description={copy[mode].description} />
    </div>
  )
}
