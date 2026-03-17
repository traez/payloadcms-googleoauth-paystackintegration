//src\auth\oauthCookies.ts
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 10 * 60 * 1000, // 10 minutes
  path: '/',
}

export const OAUTH_STATE_COOKIE = 'oauth_state'
export const OAUTH_VERIFIER_COOKIE = 'oauth_code_verifier'

/** Write both OAuth state cookies before redirecting to Google. */
export function setOAuthCookies(res: Response, state: string, codeVerifier: string): void {
  res.headers.set('Set-Cookie', serializeCookie(OAUTH_STATE_COOKIE, state))
  res.headers.append('Set-Cookie', serializeCookie(OAUTH_VERIFIER_COOKIE, codeVerifier))
}

/** Read a cookie value from the incoming request. */
export function getOAuthCookie(req: Request, name: string): string | undefined {
  const cookieHeader = req.headers.get('cookie') ?? ''
  const match = cookieHeader
    .split(';')
    .map((c) => c.trim().split('='))
    .find(([key]) => key === name)
  return match ? decodeURIComponent(match[1]) : undefined
}

/** Clear both OAuth cookies after the callback completes. */
export function clearOAuthCookies(res: Response): void {
  res.headers.append('Set-Cookie', expireCookie(OAUTH_STATE_COOKIE))
  res.headers.append('Set-Cookie', expireCookie(OAUTH_VERIFIER_COOKIE))
}

// ── helpers ──────────────────────────────────────────────────────────────────

function serializeCookie(name: string, value: string): string {
  const opts = [
    `${name}=${encodeURIComponent(value)}`,
    `Max-Age=${COOKIE_OPTIONS.maxAge / 1000}`, // Set-Cookie uses seconds
    `Path=${COOKIE_OPTIONS.path}`,
    `SameSite=${COOKIE_OPTIONS.sameSite}`,
    COOKIE_OPTIONS.httpOnly ? 'HttpOnly' : '',
    COOKIE_OPTIONS.secure ? 'Secure' : '',
  ]
  return opts.filter(Boolean).join('; ')
}

function expireCookie(name: string): string {
  return `${name}=; Max-Age=0; Path=${COOKIE_OPTIONS.path}; HttpOnly; SameSite=Lax`
}