type MainAreaProps = {
  title: string
  description: string
}

export function MainArea({ title, description }: MainAreaProps) {
  return (
    <main className="flex h-full min-w-0 flex-1 flex-col bg-bg">
      <div className="app-drag h-12 shrink-0 border-b border-input-border" />
      <div className="app-no-drag flex flex-1 flex-col gap-2 p-8">
        <h1 className="text-2xl font-semibold text-text-active">{title}</h1>
        <p className="max-w-xl text-sm text-text-muted">{description}</p>
      </div>
    </main>
  )
}
