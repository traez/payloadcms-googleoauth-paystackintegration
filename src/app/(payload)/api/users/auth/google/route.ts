//src\app\(payload)\api\users\auth\google\route.ts
import { NextResponse } from 'next/server'
import { generateCodeVerifier, generateCodeChallenge } from '@/auth/pkce'
import { setOAuthCookies } from '@/auth/oauthCookies'
import crypto from 'crypto'

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'

export async function GET() {
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = generateCodeChallenge(codeVerifier)
  const state = crypto.randomBytes(16).toString('hex')

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/users/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    prompt: 'consent',
  })

  const response = NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params}`)
  setOAuthCookies(response, state, codeVerifier)
  return response
}