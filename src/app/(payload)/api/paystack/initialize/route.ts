import { NextRequest, NextResponse } from 'next/server'

interface PaystackInitResponse {
  status: boolean
  message: string
  data: {
    access_code: string
    authorization_url: string
    reference: string
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, amount, name } = await req.json()

    if (!email || !amount || !name) {
      return NextResponse.json({ error: 'Name, email, and amount are required.' }, { status: 400 })
    }

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number.' }, { status: 400 })
    }

    const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // NGN → kobo
        callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/verify`,
        metadata: {
          custom_fields: [
            {
              display_name: 'Customer Name',
              variable_name: 'customer_name',
              value: name,
            },
          ],
        },
      }),
    })

    // ✅ Check HTTP response before parsing
    if (!paystackRes.ok) {
      return NextResponse.json(
        { error: 'Failed to reach Paystack. Please try again.' },
        { status: paystackRes.status },
      )
    }

    const data: PaystackInitResponse = await paystackRes.json() // ✅ typed

    if (!data.status) {
      return NextResponse.json(
        { error: data.message || 'Paystack initialization failed.' },
        { status: 400 },
      )
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      access_code: data.data.access_code, // ✅ added
      reference: data.data.reference,
    })
  } catch (error) {
    console.error('[Paystack Initialize Error]', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
