//src\auth\googleStrategy.ts
import type { BasePayload } from 'payload'
import type { User } from '@/payload-types'
import crypto from 'crypto'

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo'

type StrategyInput = {
  code: string
  codeVerifier: string
  redirectUri: string
  payload: BasePayload
}

type StrategyResult =
  | { user: User; error: null }
  | {
      user: null
      error:
        | 'email_not_verified'
        | 'unauthorized'
        | 'account_conflict'
        | 'token_exchange_failed'
        | 'profile_fetch_failed'
    }

/**
 * Resolves a Google OAuth code into a Payload Users document.
 *
 * Called directly from the callback route — this is NOT registered in
 * auth.strategies (which is for per-request token verification, not
 * one-time OAuth login events).
 *
 * Order of operations:
 *  1. Exchange code + PKCE verifier for Google tokens
 *  2. Fetch and verify the Google profile (email_verified must be true)
 *  3. Look up by providerUserId, then fall back to email
 *  4a. Existing user: enforce role === 'customer', check providerUserId
 *      doesn't conflict, upsert token metadata
 *  4b. New user: create customer document with random unusable password
 */
export async function resolveGoogleUser({
  code,
  codeVerifier,
  redirectUri,
  payload,
}: StrategyInput): Promise<StrategyResult> {
  // ── 1. Exchange code + PKCE verifier for tokens ───────────────────────────
  const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    }),
  })

  if (!tokenRes.ok) {
    payload.logger.error({ msg: '[googleStrategy] Token exchange failed', status: tokenRes.status })
    return { user: null, error: 'token_exchange_failed' }
  }

  const tokens = await tokenRes.json()

  // ── 2. Fetch verified Google profile ─────────────────────────────────────
  const profileRes = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })

  if (!profileRes.ok) {
    payload.logger.error({ msg: '[googleStrategy] Profile fetch failed' })
    return { user: null, error: 'profile_fetch_failed' }
  }

  const {
    sub: providerUserId,
    email,
    email_verified,
    given_name,
    family_name,
  } = await profileRes.json()

  // ── 3. Reject unverified emails ───────────────────────────────────────────
  if (!email_verified) {
    payload.logger.warn({ msg: '[googleStrategy] Email not verified', email })
    return { user: null, error: 'email_not_verified' }
  }

  // ── 4. Build the refreshed strategy entry ─────────────────────────────────
  const strategyEntry = {
    provider: 'google' as const,
    providerUserId,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? '',
    tokenExpiry: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    linkedAt: new Date().toISOString(),
  }

  // ── 5. Lookup: providerUserId first, then email ───────────────────────────
  let user: User | null = await payload
    .find({
      collection: 'users',
      where: { providerUserId: { equals: providerUserId } },
      limit: 1,
      depth: 0,
    })
    .then((r) => (r.docs[0] as User) ?? null)

  if (!user) {
    user = await payload
      .find({
        collection: 'users',
        where: { email: { equals: email } },
        limit: 1,
        depth: 0,
      })
      .then((r) => (r.docs[0] as User) ?? null)
  }

  // ── 6a. Existing user ─────────────────────────────────────────────────────
  if (user) {
    // Only customers may authenticate via Google
    if (user.role !== 'customer') {
      payload.logger.warn({
        msg: '[googleStrategy] Non-customer attempted Google login',
        email,
        role: user.role,
      })
      return { user: null, error: 'unauthorized' }
    }

    // providerUserId must match if already set — prevents account takeover
    if (user.providerUserId && user.providerUserId !== providerUserId) {
      payload.logger.error({
        msg: '[googleStrategy] providerUserId conflict',
        email,
      })
      return { user: null, error: 'account_conflict' }
    }

    // Upsert token metadata
    const strategies = (user.externalId?.authStrategies ?? []) as (typeof strategyEntry)[]
    const idx = strategies.findIndex((s) => s.provider === 'google')
    const updatedStrategies =
      idx >= 0
        ? strategies.map((s, i) => (i === idx ? strategyEntry : s))
        : [...strategies, strategyEntry]

    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        providerUserId,
        externalId: { authStrategies: updatedStrategies },
      },
    })

    return { user, error: null }
  }

  // ── 6b. New user — create customer document ───────────────────────────────
  const newUser = await payload.create({
    collection: 'users',
    data: {
      email,
      role: 'customer',
      providerUserId,
      displayName: {
        firstName: given_name ?? '',
        lastName: family_name ?? '',
      },
      externalId: { authStrategies: [strategyEntry] },
      // Random password satisfies Payload's auth:true requirement.
      // This account is only reachable via Google OAuth — the password
      // is immediately scrambled again after session issuance and is
      // never exposed or usable for password-based login.
      password: crypto.randomBytes(32).toString('hex'),
    },
  })

  return { user: newUser as User, error: null }
}