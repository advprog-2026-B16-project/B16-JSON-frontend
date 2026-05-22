'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, CreditCard, RefreshCw, WalletCards } from 'lucide-react';
import { usePayments } from '@/hooks/payment/usePayments';
import { PaymentHistory } from '@/features/payment/components';

export default function PaymentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const {
    payments,
    isLoading,
    actionLoading,
    error,
    success,
    fetchPayments,
    createPayment,
    pay,
    cancelPayment,
  } = usePayments();
  const autoCreateAttempted = useRef(false);

  const relatedPayment = initialOrderId
    ? payments.find((payment) => payment.orderId === initialOrderId)
    : undefined;

  useEffect(() => {
    if (!initialOrderId || isLoading || actionLoading || relatedPayment || autoCreateAttempted.current) {
      return;
    }

    autoCreateAttempted.current = true;
    void createPayment({ orderId: initialOrderId });
  }, [initialOrderId, isLoading, actionLoading, relatedPayment, createPayment]);

  return (
    <div className="min-h-screen bg-white p-6 py-12 text-black">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 border-4 border-black bg-white px-4 py-2 font-black uppercase shadow-[4px_4px_0px_0px_#000] hover:bg-gray-100"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 inline-block border-4 border-black bg-cyan-300 px-3 py-1 text-sm font-black uppercase shadow-[4px_4px_0px_0px_#000]">
              Secure Payment
            </p>
            <h1 className="text-5xl font-black uppercase text-green-600 md:text-6xl">Confirm Payment</h1>
            <p className="mt-4 max-w-2xl border-l-8 border-green-400 bg-green-50 px-4 py-3 text-lg font-bold">
              Payment request is created automatically after checkout, then you can pay or cancel it from here.
            </p>
          </div>
          <button
            onClick={fetchPayments}
            disabled={isLoading}
            className="flex items-center gap-2 border-4 border-black bg-white px-5 py-3 font-black uppercase shadow-[4px_4px_0px_0px_#000] hover:bg-cyan-100 disabled:opacity-50"
            title="Refresh payments"
          >
            <RefreshCw size={22} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StepCard icon={<CheckCircle2 size={28} />} title="Order Created" active={Boolean(initialOrderId)} />
          <StepCard icon={<CreditCard size={28} />} title="Payment Request" active={Boolean(relatedPayment)} />
          <StepCard icon={<WalletCards size={28} />} title="Wallet Paid" active={relatedPayment?.status === 'SUCCESS'} />
        </div>

        {initialOrderId && (
          <div className="mb-10 border-4 border-black bg-yellow-100 p-6 shadow-[8px_8px_0px_0px_#000]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase text-gray-600">Checkout confirmation</p>
                <h2 className="text-2xl font-black uppercase">Order #{initialOrderId.slice(0, 8)}</h2>
                <p className="mt-1 font-bold text-gray-700">
                  {relatedPayment
                    ? `Payment reference ${relatedPayment.referenceCode} is ${relatedPayment.status === 'PENDING' ? 'UNPAID' : relatedPayment.status}.`
                    : 'Creating payment request automatically...'}
                </p>
              </div>
              {relatedPayment?.status === 'SUCCESS' && (
                <button
                  onClick={() => router.push('/dashboard/transactions')}
                  className="border-4 border-black bg-black px-6 py-3 font-black uppercase text-white shadow-[4px_4px_0px_0px_#000] hover:bg-green-400 hover:text-black"
                >
                  View Transaction
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 border-4 border-black bg-red-300 p-5 font-black uppercase shadow-[6px_6px_0px_0px_#000]">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-8 border-4 border-black bg-emerald-300 p-5 font-black uppercase shadow-[6px_6px_0px_0px_#000]">
            {success}
          </div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid grid-cols-1 gap-8"
        >
          <PaymentHistory payments={payments} onPay={pay} onCancel={cancelPayment} isLoading={actionLoading || isLoading} />
        </motion.div>
      </div>
    </div>
  );
}

function StepCard({ icon, title, active }: { icon: React.ReactNode; title: string; active: boolean }) {
  return (
    <div className={`border-4 border-black p-5 shadow-[6px_6px_0px_0px_#000] ${active ? 'bg-green-300' : 'bg-white'}`}>
      <div className="mb-3 flex items-center gap-3">
        <div className="border-2 border-black bg-white p-2">{icon}</div>
        <span className="text-xs font-black uppercase">{active ? 'Done' : 'Pending'}</span>
      </div>
      <p className="text-xl font-black uppercase">{title}</p>
    </div>
  );
}
