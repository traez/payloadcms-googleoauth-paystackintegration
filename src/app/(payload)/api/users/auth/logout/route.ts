//src\app\(payload)\api\users\auth\logout\route.ts
import { NextRequest, NextResponse } from 'next/server'

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL!
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL ?? SERVER_URL

export async function POST(req: NextRequest) {
  const cookie = req.headers.get('cookie') ?? ''

  // Tell Payload to invalidate the session server-side
  const payloadRes = await fetch(`${SERVER_URL}/api/users/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      cookie,
    },
  })

  const response = NextResponse.redirect(`${FRONTEND_URL}/login`, { status: 303 })

  // Forward Payload's Set-Cookie header so the browser actually clears
  // the payload-token cookie
  const setCookie = payloadRes.headers.get('set-cookie')
  if (setCookie) {
    response.headers.set('set-cookie', setCookie)
  }

  return response
}