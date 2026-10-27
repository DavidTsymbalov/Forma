import { Suspense } from 'react'

import { AuthForm } from '@/components/AuthForm'

export default function RegisterPage() {
  return (
    <Suspense fallback={<main className="grid min-h-screen place-items-center text-muted">Загрузка…</main>}>
      <AuthForm mode="register" />
    </Suspense>
  )
}
