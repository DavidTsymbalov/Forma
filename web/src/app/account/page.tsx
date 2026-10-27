import { redirect } from 'next/navigation'

import { signOut } from '@/app/account/actions'
import { createClient } from '@/lib/supabase/server'

export default async function AccountPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, plan, avatar_url')
    .eq('id', user.id)
    .maybeSingle()

  const name = profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'
  const plan = profile?.plan || 'free'

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-6 py-12">
      <p className="text-sm text-muted">Forma</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Аккаунт</h1>

      <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-border bg-panel p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-bg text-sm font-semibold">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-base font-medium">{name}</p>
            <p className="text-sm text-muted">{user.email}</p>
          </div>
        </div>

        <div className="grid gap-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted">План</span>
            <span className="capitalize">{plan}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted">Почта</span>
            <span>{user.email}</span>
          </div>
        </div>

        <form action={signOut} className="pt-2">
          <button
            type="submit"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm text-muted hover:text-text"
          >
            Выйти
          </button>
        </form>
      </div>
    </main>
  )
}
