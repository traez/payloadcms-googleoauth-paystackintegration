//src\auth\getUser.ts
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import type { User } from '@/payload-types'

/**
 * Resolves the currently authenticated user from Payload's session cookie.
 * Use this in Server Actions and Server Components.
 *
 * Returns null if the request is unauthenticated or the token is invalid.
 */
export async function getUser(): Promise<User | null> {
  const payload = await getPayload({ config })

  const { user } = await payload.auth({
    headers: await headers(),
  })

  return (user as User) ?? null
}