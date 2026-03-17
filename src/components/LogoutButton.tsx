//src\components\LogoutButton.tsx
'use client'

import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/users/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh() // clears any cached server component state
  }

  return (
    <button onClick={handleLogout} type="button">
      Sign out
    </button>
  )
}
