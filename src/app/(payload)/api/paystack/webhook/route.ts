//src\app\(payload)\api\paystack\webhook\route.ts
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  // ✅ Verify Paystack signature — this is non-negotiable
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
    .update(rawBody)
    .digest('hex')

  const paystackSignature = req.headers.get('x-paystack-signature')

  if (hash !== paystackSignature) {
    console.warn('[Webhook] Invalid signature — potential spoofed request')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: { event: string; data: Record<string, unknown> }

  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // ✅ Only handle charge.success
  if (event.event === 'charge.success') {
    const data = event.data

    const reference = data.reference as string
    const amount = (data.amount as number) / 100 // kobo → NGN
    const email = (data.customer as { email: string }).email
    const status = data.status as string
    const channel = data.channel as string
    const paidAt = data.paid_at as string
    const currency = data.currency as string

    const customFields = (
      data.metadata as { custom_fields?: { variable_name: string; value: string }[] }
    )?.custom_fields

    const name = customFields?.find((f) => f.variable_name === 'customer_name')?.value ?? null

    console.log('[Webhook] charge.success received:', {
      reference,
      amount,
      email,
      name,
      status,
      channel,
      paidAt,
      currency,
    })

    // ✅ TODO: Persist to your database here
    // Example (Payload CMS / Prisma / Drizzle / etc.):
    //
    // await db.orders.upsert({
    //   where: { reference },
    //   update: { status: 'paid', paidAt },
    //   create: { reference, amount, email, name, status: 'paid', channel, paidAt, currency },
    // })
    //
    // This is the ONLY place you should mark an order as paid.
  }

  // Always return 200 quickly — Paystack retries on non-2xx
  return NextResponse.json({ received: true })
}
