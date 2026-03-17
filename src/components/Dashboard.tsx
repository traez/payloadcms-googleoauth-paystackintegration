//src\components\Dashboard.tsx
import { getUser } from '@/auth/getUser'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'

export default async function DashboardPage() {
  const user = await getUser()

  if (!user || user.role !== 'customer') {
    redirect('/login')
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#f9f9f9',
        fontFamily: 'system-ui, sans-serif',
        padding: '40px 24px',
      }}
    >
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>
        {/* Nav */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <span style={{ fontWeight: '600', fontSize: '15px', color: '#111' }}>Dashboard</span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <a
              href="/account"
              style={{ fontSize: '13.5px', color: '#555', textDecoration: 'none' }}
            >
              Account
            </a>
            <LogoutButton />
          </div>
        </div>

        {/* Welcome */}
        <h1 style={{ fontSize: '22px', fontWeight: '600', color: '#111', marginBottom: '8px' }}>
          Welcome{user.displayName?.firstName ? `, ${user.displayName.firstName}` : ''}
        </h1>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '32px' }}>
          You're signed in as <strong>{user.email}</strong>.
        </p>

        {/* Protected notice */}
        <div
          style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '14px 16px',
            marginBottom: '32px',
            fontSize: '13.5px',
            color: '#166534',
          }}
        >
          ✓ Protected route — only verified customers can see this page.
        </div>

        {/* Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { href: '/account', label: 'View my account details' },
            { href: '/orders', label: 'My orders' },
            { href: '/checkout', label: 'Checkout' },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 16px',
                background: '#fff',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                color: '#111',
                fontSize: '14px',
                textDecoration: 'none',
              }}
            >
              {label}
              <span style={{ color: '#bbb' }}>→</span>
            </a>
          ))}
        </div>
      </div>
    </main>
  )
}