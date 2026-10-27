'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'

import { openDesktopSession, wantsDesktopRedirect } from '@/lib/desktop'
import { createClient } from '@/lib/supabase/client'

type Mode = 'login' | 'register'

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    const supabase = createClient()
    const desktop = wantsDesktopRedirect(searchParams.toString())

    try {
      if (mode === 'register') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name.trim() || undefined },
          },
        })
        if (signUpError) throw signUpError

        if (data.session) {
          if (desktop) {
            openDesktopSession(data.session)
            return
          }
          router.replace('/account')
          router.refresh()
          return
        }

        setInfo('Проверь почту и подтверди регистрацию, затем войди.')
        return
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (signInError) throw signInError
      if (!data.session) throw new Error('Сессия не создалась')

      if (desktop) {
        openDesktopSession(data.session)
        return
      }

      router.replace('/account')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Что-то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="mb-8">
        <p className="text-sm text-muted">Forma</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {mode === 'login' ? 'Вход' : 'Регистрация'}
        </h1>
        <p className="mt-2 text-sm text-muted">Пока только почта и пароль.</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-2xl border border-border bg-panel p-5">
        {mode === 'register' && (
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="text-muted">Имя</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-text"
              autoComplete="name"
            />
          </label>
        )}

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted">Почта</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-text"
            autoComplete="email"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="text-muted">Пароль</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-lg border border-border bg-bg px-3 py-2 outline-none focus:border-text"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </label>

        {error && <p className="text-sm text-danger">{error}</p>}
        {info && <p className="text-sm text-muted">{info}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-text disabled:opacity-60"
        >
          {loading ? 'Секунду…' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        {mode === 'login' ? (
          <>
            Нет аккаунта?{' '}
            <Link href={`/register?${searchParams.toString()}`} className="underline">
              Регистрация
            </Link>
          </>
        ) : (
          <>
            Уже есть аккаунт?{' '}
            <Link href={`/login?${searchParams.toString()}`} className="underline">
              Войти
            </Link>
          </>
        )}
      </p>
    </main>
  )
}
