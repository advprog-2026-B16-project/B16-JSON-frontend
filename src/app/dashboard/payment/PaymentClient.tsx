'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { usePayments } from '@/hooks/payment/usePayments';
import { PaymentHistory, PaymentActionForm } from '@/features/payment/components';

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
  } = usePayments();

  const handleCreatePayment = async (orderId: string) => {
    await createPayment({ orderId });
  };

  return (
    <div className="min-h-screen bg-background flex justify-center p-6 py-12">
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => router.back()}
        className="absolute top-8 left-8 flex items-center gap-2 font-bold hover:underline decoration-4 text-black"
      >
        <ArrowLeft size={20} /> Back
      </motion.button>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-5xl flex flex-col lg:flex-row gap-8"
      >
        {/* Left Side: Actions */}
        <div className="w-full lg:w-1/3 flex flex-col gap-6">
          <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000] text-black">
            
            <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-6">
              <h1 className="text-3xl font-black uppercase tracking-tight">Payment</h1>
              <button
                onClick={fetchPayments}
                disabled={isLoading}
                className="p-2 border-4 border-black hover:bg-gray-100 disabled:opacity-50 transition-colors shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1"
                title="Refresh payments"
              >
                <RefreshCw size={24} className={isLoading ? "animate-spin" : ""} />
              </button>
            </div>

            {/* Alerts */}
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-400 border-4 border-black p-4 mb-6 font-bold shadow-[4px_4px_0px_0px_#000]">
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-emerald-400 border-4 border-black p-4 mb-6 font-bold shadow-[4px_4px_0px_0px_#000]">
                {success}
              </motion.div>
            )}

            <PaymentActionForm 
              isLoading={actionLoading || isLoading} 
              onSubmit={handleCreatePayment} 
              initialOrderId={initialOrderId}
            />
            
          </div>
        </div>

        {/* Right Side: History */}
        <div className="w-full lg:w-2/3 flex flex-col h-full">
          <PaymentHistory payments={payments} onPay={pay} isLoading={actionLoading || isLoading} />
        </div>
      </motion.div>
    </div>
  );
}
