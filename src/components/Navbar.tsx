// src/components/Navbar.tsx
import Link from 'next/link'
import { getUser } from '@/auth/getUser'
import { LogoutButton } from '@/components/LogoutButton'

const Navbar = async () => {
  const user = await getUser()

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Checkout', href: '/checkout' },
    { name: 'Verify', href: '/verify' },
    ...(user
      ? [{ name: 'AccountDashboard', href: '/account-dashboard' }]
      : [{ name: 'Login', href: '/login' }]),
  ]

  const greeting = user ? `Hello, ${user.displayName?.firstName ?? user.email}` : 'Hello, Guest'

  return (
    <nav className="flex items-center gap-6 px-6 py-4 border-b border-[#e5e5e5] font-sans text-sm">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-white hover:text-blue-500 no-underline transition-colors"
        >
          {link.name}
        </Link>
      ))}

      <span className="ml-auto text-white">{greeting}</span>

      {user && <LogoutButton />}
    </nav>
  )
}

export default Navbar
