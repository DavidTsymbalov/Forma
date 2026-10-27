import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'

import { supabase, type Profile } from '@/lib/supabase'

type AuthContextValue = {
  ready: boolean
  session: Session | null
  user: User | null
  profile: Profile | null
  signIn: () => Promise<void>
  signUp: () => Promise<void>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function loadProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, plan')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error(error)
    return null
  }
  return data as Profile | null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  const refreshProfile = useCallback(async () => {
    const userId = (await supabase.auth.getUser()).data.user?.id
    if (!userId) {
      setProfile(null)
      return
    }
    setProfile(await loadProfile(userId))
  }, [])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      setSession(data.session)
      if (data.session?.user) {
        setProfile(await loadProfile(data.session.user.id))
      }
      setReady(true)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession)
      if (nextSession?.user) {
        setProfile(await loadProfile(nextSession.user.id))
      } else {
        setProfile(null)
      }
    })

    const unsubscribeDeepLink = window.forma?.onAuthDeepLink(async ({ accessToken, refreshToken }) => {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      if (error) {
        console.error(error)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
      unsubscribeDeepLink?.()
    }
  }, [])

  const signIn = useCallback(async () => {
    await window.forma?.openAuth('login')
  }, [])

  const signUp = useCallback(async () => {
    await window.forma?.openAuth('register')
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    await window.forma?.clearAuthStorage?.()
    setSession(null)
    setProfile(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      session,
      user: session?.user ?? null,
      profile,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [ready, session, profile, signIn, signUp, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return value
}
