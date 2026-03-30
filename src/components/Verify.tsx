//src\components\Verify.tsx
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface PaymentData {
  reference: string;
  amount: number;
  email: string;
  name: string | null;
  paid_at: string;
  channel: string;
}

type Status = "loading" | "success" | "failed";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const [status, setStatus] = useState<Status>("loading");
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!reference) {
      setErrorMsg("No transaction reference found.");
      setStatus("failed");
      return;
    }

    fetch(`/api/paystack/verify?reference=${reference}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPayment(data)
          setStatus('success')
        } else {
          setErrorMsg(data.error || 'Payment could not be verified.')
          setStatus('failed')
        }
      })
      .catch(() => {
        setErrorMsg('Network error while verifying payment.')
        setStatus('failed')
      })
  }, [reference]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        {/* Loading */}
        {status === 'loading' && (
          <div className="py-8">
            <svg
              className="animate-spin h-12 w-12 text-green-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <p className="text-gray-600 font-medium">Verifying your payment...</p>
            <p className="text-gray-400 text-sm mt-1">Please don&apos;t close this page.</p>
          </div>
        )}

        {/* Success */}
        {status === 'success' && payment && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Payment Successful!</h1>
            <p className="text-gray-500 text-sm mb-6">
              {payment.name ? `Thank you, ${payment.name}!` : 'Thank you for your payment!'}
            </p>

            {/* Receipt */}
            <div className="bg-gray-50 rounded-xl p-5 text-left space-y-3 mb-6 border border-gray-100">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Receipt
              </h2>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold text-gray-900">
                  ₦{payment.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-900">{payment.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Channel</span>
                <span className="font-medium text-gray-900 capitalize">{payment.channel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-900">
                  {new Date(payment.paid_at).toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-400 break-all">Ref: {payment.reference}</p>
              </div>
            </div>

            <Link
              href="/"
              className="inline-block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
            >
              Back to Home
            </Link>
          </>
        )}

        {/* Failed */}
        {status === 'failed' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Payment Failed</h1>
            <p className="text-gray-500 text-sm mb-2">
              {errorMsg || 'We could not verify your payment.'}
            </p>
            <p className="text-gray-400 text-xs mb-6">
              If you were charged, please contact support with your reference.
            </p>
            {reference && (
              <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-4 py-2 mb-6 break-all">
                Ref: {reference}
              </p>
            )}
            <Link
              href="/checkout"
              className="inline-block w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
            >
              Try Again
            </Link>
          </>
        )}
      </div>
    </main>
  )
}