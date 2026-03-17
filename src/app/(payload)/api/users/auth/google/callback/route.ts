//src\app\(payload)\api\users\auth\google\callback\route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import {
  clearOAuthCookies,
  getOAuthCookie,
  OAUTH_STATE_COOKIE,
  OAUTH_VERIFIER_COOKIE,
} from '@/auth/oauthCookies'
import { resolveGoogleUser } from '@/auth/googleStrategy'
import crypto from 'crypto'

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? process.env.NEXT_PUBLIC_SERVER_URL!
const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL!

// Maps strategy errors to query params the frontend can display
const ERROR_REDIRECTS: Record<string, string> = {
  email_not_verified: 'email_not_verified',
  unauthorized: 'unauthorized',
  account_conflict: 'account_conflict',
  token_exchange_failed: 'server_error',
  profile_fetch_failed: 'server_error',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const returnedState = searchParams.get('state')
  const error = searchParams.get('error')

  // ── 1. Handle cancellation or Google-side errors ──────────────────────────
  if (error || !code || !returnedState) {
    return NextResponse.redirect(`${FRONTEND_URL}/login?error=oauth_cancelled`)
  }

  // ── 2. Validate CSRF state + recover PKCE verifier from cookies ───────────
  const storedState = getOAuthCookie(req, OAUTH_STATE_COOKIE)
  const codeVerifier = getOAuthCookie(req, OAUTH_VERIFIER_COOKIE)

  if (!storedState || returnedState !== storedState || !codeVerifier) {
    const res = NextResponse.redirect(`${FRONTEND_URL}/login?error=invalid_state`)
    clearOAuthCookies(res)
    return res
  }

  try {
    const payload = await getPayload({ config })
    const redirectUri = `${SERVER_URL}/api/users/auth/google/callback`

    // ── 3. Resolve (or create) the user via the Google strategy ──────────────
    const { user, error: strategyError } = await resolveGoogleUser({
      code,
      codeVerifier,
      redirectUri,
      payload,
    })

    if (!user) {
      const errorParam = ERROR_REDIRECTS[strategyError!] ?? 'server_error'
      const res = NextResponse.redirect(`${FRONTEND_URL}/login?error=${errorParam}`)
      clearOAuthCookies(res)
      return res
    }

    // ── 4. Issue a Payload session ────────────────────────────────────────────
    //    Payload's Local API has no loginAs(userId) method — the only way to
    //    obtain a signed session cookie is POST /api/users/login with email +
    //    password. We set a single-use random password, call login, then
    //    immediately scramble it so it can never be reused.

    const oneTimePassword = crypto.randomBytes(32).toString('hex')

    await payload.update({
      collection: 'users',
      id: user.id,
      data: { password: oneTimePassword },
    })

    const loginRes = await fetch(`${SERVER_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email, password: oneTimePassword }),
    })

    // Scramble immediately — window is now closed
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { password: crypto.randomBytes(32).toString('hex') },
    })

    if (!loginRes.ok) {
      payload.logger.error({ msg: '[Google callback] Payload login call failed', userId: user.id })
      const res = NextResponse.redirect(`${FRONTEND_URL}/login?error=server_error`)
      clearOAuthCookies(res)
      return res
    }

    // ── 5. Forward Payload's session cookie and redirect ─────────────────────
    const response = NextResponse.redirect(`${FRONTEND_URL}/account`)
    clearOAuthCookies(response)

    const setCookie = loginRes.headers.get('set-cookie')
    if (setCookie) {
      response.headers.set('set-cookie', setCookie)
    }

    return response
  } catch (err) {
    console.error('[Google callback] Unhandled error', err)
    const res = NextResponse.redirect(`${FRONTEND_URL}/login?error=server_error`)
    clearOAuthCookies(res)
    return res
  }
}
