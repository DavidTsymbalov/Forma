import type { Session } from '@supabase/supabase-js'

export function openDesktopSession(session: Session) {
  const url = new URL('forma://auth')
  url.searchParams.set('access_token', session.access_token)
  url.searchParams.set('refresh_token', session.refresh_token)
  window.location.href = url.toString()
}

export function wantsDesktopRedirect(search: string) {
  const params = new URLSearchParams(search)
  return params.get('next') === 'desktop'
}
