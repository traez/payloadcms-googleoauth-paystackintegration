//src\components\Logout.tsx
import { LogoutButton } from '@/components/LogoutButton'

export default function LogoutPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f9f9f9',
        fontFamily: 'system-ui, sans-serif',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '340px',
          background: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: '10px',
          padding: '36px 32px',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#111', marginBottom: '8px' }}>
          Sign out?
        </h1>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '28px', lineHeight: '1.6' }}>
          You'll be redirected to the login page.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <LogoutButton />
          <a
            href="/account"
            style={{
              display: 'block',
              padding: '10px 16px',
              border: '1px solid #e5e5e5',
              borderRadius: '7px',
              color: '#555',
              fontSize: '14px',
              textDecoration: 'none',
            }}
          >
            Cancel
          </a>
        </div>
      </div>
    </main>
  )
}