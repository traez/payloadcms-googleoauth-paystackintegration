//src\app\(payload)\api\paystack\verify\route.ts
import { NextRequest, NextResponse } from 'next/server'

interface Customer {
  id: number
  first_name: string | null
  last_name: string | null
  email: string
  customer_code: string
  phone: string | null
  metadata: unknown | null
  risk_action: string
  international_format_phone: string | null
}

interface Authorization {
  authorization_code: string
  bin: string
  last4: string
  exp_month: string
  exp_year: string
  channel: string
  card_type: string
  bank: string
  country_code: string
  brand: string
  reusable: boolean
  signature: string
  account_name: string | null
}

interface TransactionData {
  id: number
  status: string
  reference: string
  amount: number
  paid_at: string
  created_at: string
  channel: string
  currency: string
  fees: number
  authorization: Authorization
  customer: Customer
  metadata: {
    custom_fields?: {
      display_name: string
      variable_name: string
      value: string
    }[]
  }
}

interface VerificationResponse {
  status: boolean
  message: string
  data: TransactionData
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const reference = searchParams.get('reference')

  if (!reference) {
    return NextResponse.json({ error: 'Transaction reference is missing.' }, { status: 400 })
  }

  try {
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    })

    // ✅ Check HTTP response before parsing
    if (!paystackRes.ok) {
      return NextResponse.json(
        { error: 'Failed to reach Paystack.' },
        { status: paystackRes.status },
      )
    }

    const data: VerificationResponse = await paystackRes.json() // ✅ typed

    if (!data.status || data.data.status !== 'success') {
      return NextResponse.json(
        {
          error: 'Payment verification failed.',
          status: data.data?.status ?? 'unknown',
        },
        { status: 400 },
      )
    }

    // ✅ Return only what frontend needs — never expose raw Paystack response
    return NextResponse.json({
      success: true,
      reference: data.data.reference,
      amount: data.data.amount / 100, // kobo → NGN
      email: data.data.customer.email,
      name:
        data.data.metadata?.custom_fields?.find((f) => f.variable_name === 'customer_name')
          ?.value ?? null,
      paid_at: data.data.paid_at,
      channel: data.data.channel,
      currency: data.data.currency, // ✅ useful addition
      fees: data.data.fees / 100, // ✅ useful addition
    })
  } catch (error) {
    console.error('[Paystack Verify Error]', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
