export function buildDesktopDeepLink(accessToken: string, refreshToken: string) {
  const url = new URL('forma://auth')
  url.searchParams.set('access_token', accessToken)
  url.searchParams.set('refresh_token', refreshToken)
  return url.toString()
}

export function shouldOpenDesktop(next: string | null | undefined) {
  return next === 'desktop'
}
