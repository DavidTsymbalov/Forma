import logoUrl from '../../assets/icons/forma-logo.svg'
import { useAuth } from '@/auth/AuthProvider'

export function SignInScreen() {
  const { signIn, signUp } = useAuth()

  return (
    <div className="app-frame">
      <main className="flex h-full w-full flex-col bg-bg">
        <div className="app-drag h-12 shrink-0" />
        <div className="app-no-drag flex flex-1 flex-col items-center justify-center gap-8 px-6">
          <div className="flex flex-col items-center gap-3">
            <img src={logoUrl} alt="" className="h-14 w-14" />
            <h1 className="text-3xl font-semibold tracking-wide text-text-active">Forma</h1>
            <p className="text-sm text-text-muted">Войди, чтобы продолжить</p>
          </div>

          <div className="flex w-full max-w-xs flex-col items-center gap-3">
            <button type="button" onClick={() => void signIn()} className="signin-primary">
              Войти
            </button>
            <button type="button" onClick={() => void signUp()} className="signin-link">
              Создать аккаунт
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
