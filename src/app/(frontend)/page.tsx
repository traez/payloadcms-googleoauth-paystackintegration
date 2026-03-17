import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'
import Link from 'next/link'
import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  return (
    <div className="home">
      <div className="content">
        <picture>
          <source srcSet="https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-favicon.svg" />
          <Image
            alt="Payload Logo"
            height={65}
            src="https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-favicon.svg"
            width={65}
          />
        </picture>
        {!user && <h1>Welcome to your new project.</h1>}
        {user && <h1>Welcome back, {user.email}</h1>}
        <div className="links">
          <a
            className="admin"
            href={payloadConfig.routes.admin}
            rel="noopener noreferrer"
            target="_blank"
          >
            Go to admin panel
          </a>
          <a
            className="docs"
            href="https://payloadcms.com/docs"
            rel="noopener noreferrer"
            target="_blank"
          >
            Documentation
          </a>
        </div>
      </div>
      <div className="footer">
        <p>Update this page by editing</p>
        <a className="codeLink" href={fileURL}>
          <code>app/(frontend)/page.tsx</code>
        </a>
      </div>
      <nav
        style={{
          display: 'flex',
          gap: '24px',
          padding: '16px 24px',
          borderBottom: '1px solid #e5e5e5',
          fontFamily: 'system-ui, sans-serif',
          fontSize: '14px',
        }}
      >
        <Link href="/login" style={{ color: '#555', textDecoration: 'none' }}>
          Login
        </Link>
        <Link href="/account" style={{ color: '#555', textDecoration: 'none' }}>
          Account
        </Link>
        <Link href="/dashboard" style={{ color: '#555', textDecoration: 'none' }}>
          Dashboard
        </Link>
        <Link href="/logout" style={{ color: '#555', textDecoration: 'none' }}>
          Logout
        </Link>
      </nav>
    </div>
  )
}
