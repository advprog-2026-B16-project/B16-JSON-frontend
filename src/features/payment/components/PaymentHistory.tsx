import { PaymentResponse } from '@/types/wallet';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CreditCard, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface Props {
  payments: PaymentResponse[];
  onPay: (referenceCode: string) => void;
  isLoading: boolean;
}

export function PaymentHistory({ payments, onPay, isLoading }: Props) {
  return (
    <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000] text-black h-full overflow-hidden flex flex-col">
      <div className="flex items-center gap-4 border-b-4 border-black pb-6 mb-6 shrink-0">
        <div className="bg-cyan-300 border-4 border-black p-3 shadow-[4px_4px_0px_0px_#000]">
          <CreditCard size={28} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight">Payments</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[600px] styled-scrollbar">
        <AnimatePresence>
          {payments.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col items-center justify-center py-12 text-center text-gray-400"
            >
              <CreditCard size={48} className="mb-4 opacity-50" />
              <p className="text-xl font-black uppercase italic">No payments found</p>
              <p className="font-bold">You have not made any payments yet.</p>
            </motion.div>
          ) : (
            [...payments].sort((a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime()).map((payment) => (
              <motion.div
                key={payment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] flex items-center justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-black text-lg">Order: {payment.orderId.slice(0,8)}...</p>
                    <div className="flex items-center gap-2 text-xs font-bold font-mono text-gray-500">
                      <span>Ref: {payment.referenceCode}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {payment.status === 'PAID' && <CheckCircle2 size={12} className="text-green-600" />}
                        {payment.status === 'FAILED' && <XCircle size={12} className="text-red-600" />}
                        {payment.status === 'PENDING' && <Clock size={12} className="text-yellow-600" />}
                        {payment.status === 'EXPIRED' && <AlertCircle size={12} className="text-gray-600" />}
                        {payment.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-xl font-black ${payment.status === 'PAID' ? 'text-green-600' : 'text-black'}`}>
                    ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  {payment.status === 'PENDING' && (
                    <button
                      onClick={() => onPay(payment.referenceCode)}
                      disabled={isLoading}
                      className="bg-black text-white px-4 py-2 font-bold border-2 border-transparent hover:bg-white hover:text-black hover:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Processing...' : 'Pay Now'}
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
