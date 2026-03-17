//src\auth\requireUser.ts
import { getUser } from './getUser'
import type { User } from '@/payload-types'

/**
 * Like getUser(), but throws a redirect-friendly error if unauthenticated.
 * Use at the top of any Server Action that requires a logged-in user.
 */
export async function requireUser(): Promise<User> {
  const user = await getUser()

  if (!user) {
    throw new Error('UNAUTHENTICATED')
  }

  return user
}

/**
 * Requires a customer-role user specifically.
 * Throws if unauthenticated or if the role is wrong (e.g., staff hitting a
 * customer-only action).
 */
export async function requireCustomer(): Promise<User> {
  const user = await requireUser()

  if (user.role !== 'customer') {
    throw new Error('FORBIDDEN')
  }

  return user
}