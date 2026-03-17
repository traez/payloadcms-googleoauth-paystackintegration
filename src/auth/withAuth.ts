//src\auth\withAuth.ts
import { requireCustomer } from './requireUser'
import { redirect } from 'next/navigation'
import type { User } from '@/payload-types'

type AuthedAction<TArgs extends unknown[], TReturn> = (
  user: User,
  ...args: TArgs
) => Promise<TReturn>

/**
 * Wraps a Server Action with authentication + customer-role enforcement.
 * Redirects to /login on auth failure instead of throwing.
 *
 * Usage:
 *   export const myAction = withCustomerAuth(async (user, data) => { ... })
 */
export function withCustomerAuth<TArgs extends unknown[], TReturn>(
  action: AuthedAction<TArgs, TReturn>,
) {
  return async (...args: TArgs): Promise<TReturn> => {
    let user: User

    try {
      user = await requireCustomer()
    } catch {
      redirect('/login')
    }

    return action(user, ...args)
  }
}