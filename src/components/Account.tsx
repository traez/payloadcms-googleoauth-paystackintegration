//src\components\Account.tsx
import { getUser } from '@/auth/getUser'
import { redirect } from 'next/navigation'
import { LogoutButton } from '@/components/LogoutButton'

export default async function AccountPage() {
  const user = await getUser()

  if (!user || user.role !== 'customer') {
    redirect('/login')
  }

  const firstName = user.displayName?.firstName ?? ''
  const lastName = user.displayName?.lastName ?? ''
  const strategies = (user.externalId?.authStrategies ?? []) as any[]
  const google = strategies.find((s) => s.provider === 'google')

  const row = (label: string, value: React.ReactNode) => (
    <tr key={label}>
      <td
        style={{
          padding: '8px 12px 8px 0',
          color: '#666',
          fontSize: '13.5px',
          whiteSpace: 'nowrap',
          verticalAlign: 'top',
        }}
      >
        {label}
      </td>
      <td style={{ padding: '8px 0', color: '#111', fontSize: '13.5px', wordBreak: 'break-all' }}>
        {value ?? <span style={{ color: '#bbb' }}>—</span>}
      </td>
    </tr>
  )

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
            marginBottom: '32px',
          }}
        >
          <span style={{ fontWeight: '600', fontSize: '15px', color: '#111' }}>My Account</span>
          <LogoutButton />
        </div>

        {/* Identity */}
        <section
          style={{
            background: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: '10px',
            padding: '24px',
            marginBottom: '16px',
          }}
        >
          <h2
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '16px',
            }}
          >
            Identity
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {row('User ID', user.id)}
              {row('Email', user.email)}
              {row(
                'Role',
                <span
                  style={{
                    background: '#eff6ff',
                    color: '#2563eb',
                    fontSize: '12px',
                    fontWeight: '600',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {user.role}
                </span>,
              )}
              {row('First name', firstName)}
              {row('Last name', lastName)}
            </tbody>
          </table>
        </section>

        {/* Google OAuth */}
        {google && (
          <section
            style={{
              background: '#fff',
              border: '1px solid #e5e5e5',
              borderRadius: '10px',
              padding: '24px',
              marginBottom: '16px',
            }}
          >
            <h2
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#999',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                marginBottom: '16px',
              }}
            >
              Google OAuth
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {row('Provider Sub', user.providerUserId)}
                {row(
                  'Linked at',
                  google.linkedAt ? new Date(google.linkedAt).toLocaleString() : null,
                )}
                {row(
                  'Token expires',
                  google.tokenExpiry ? new Date(google.tokenExpiry).toLocaleString() : null,
                )}
              </tbody>
            </table>
          </section>
        )}

        {/* Timestamps */}
        <section
          style={{
            background: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: '10px',
            padding: '24px',
          }}
        >
          <h2
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#999',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '16px',
            }}
          >
            Record
          </h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {row('Created', user.createdAt ? new Date(user.createdAt).toLocaleString() : null)}
              {row(
                'Last updated',
                user.updatedAt ? new Date(user.updatedAt).toLocaleString() : null,
              )}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  )
}