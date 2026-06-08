import { PaymentResponse } from '@/types/wallet';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CreditCard, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { formatDollar } from '@/lib/currency';
import { formatShortId } from '@/lib/ids';
import { getPaymentTimeMs } from '@/lib/paymentTime';

interface Props {
  payments: PaymentResponse[];
  onPay: (referenceCode: string) => void;
  onCancel: (referenceCode: string) => void;
  isLoading: boolean;
}

const statusStyle: Record<PaymentResponse['status'], string> = {
  PENDING: 'bg-yellow-300 text-black',
  SUCCESS: 'bg-green-400 text-black',
  EXPIRED: 'bg-gray-300 text-black',
  FAILED: 'bg-red-400 text-white',
  CANCELLED: 'bg-slate-300 text-black',
};

function formatDateTime(value?: string | null) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString('id-ID');
}

function StatusIcon({ status }: { status: PaymentResponse['status'] }) {
  if (status === 'SUCCESS') return <CheckCircle2 size={14} className="text-green-700" />;
  if (status === 'FAILED' || status === 'CANCELLED') return <XCircle size={14} className="text-red-700" />;
  if (status === 'EXPIRED') return <AlertCircle size={14} className="text-gray-700" />;
  return <Clock size={14} className="text-yellow-700" />;
}

function displayStatus(status: PaymentResponse['status']) {
  return status === 'PENDING' ? 'UNPAID' : status;
}

export function PaymentHistory({ payments, onPay, onCancel, isLoading }: Props) {
  return (
    <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000] text-black h-full overflow-hidden flex flex-col">
      <div className="flex items-center gap-4 border-b-4 border-black pb-6 mb-6 shrink-0">
        <div className="bg-cyan-300 border-4 border-black p-3 shadow-[4px_4px_0px_0px_#000]">
          <CreditCard size={28} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-black uppercase text-gray-500">Step 3</p>
          <h2 className="text-3xl font-black uppercase tracking-tight">Payment Queue</h2>
        </div>
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
              <p className="font-bold">Checkout an item first, then payment will appear here automatically.</p>
            </motion.div>
          ) : (
            [...payments]
              .sort((a, b) => getPaymentTimeMs(b.expiresAt) - getPaymentTimeMs(a.expiresAt))
              .map((payment) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] flex flex-col gap-4 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-black text-lg uppercase" title={payment.orderId}>Order {formatShortId(payment.orderId)}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold font-mono text-gray-500">
                        <span>Ref: {payment.referenceCode}</span>
                        <span>|</span>
                        <span className="flex items-center gap-1">
                          <StatusIcon status={payment.status} />
                          {displayStatus(payment.status)}
                        </span>
                      </div>
                    </div>
                    <p
                      className={`max-w-[180px] truncate text-right text-xl font-black ${payment.status === 'SUCCESS' ? 'text-green-600' : 'text-black'}`}
                      title={formatDollar(payment.amount)}
                    >
                      {formatDollar(payment.amount)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 border-t-2 border-black pt-3 text-sm font-bold md:grid-cols-2">
                    <div>
                      <span className="block text-xs font-black uppercase text-gray-500">Expires</span>
                      {formatDateTime(payment.expiresAt)}
                    </div>
                    <div>
                      <span className="block text-xs font-black uppercase text-gray-500">Paid At</span>
                      {formatDateTime(payment.paidAt)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className={`border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000] ${statusStyle[payment.status]}`}>
                      {displayStatus(payment.status)}
                    </span>
                    {payment.status === 'PENDING' && (
                      <div className="flex flex-wrap justify-end gap-3">
                        <button
                          onClick={() => onCancel(payment.referenceCode)}
                          disabled={isLoading}
                          className="border-4 border-black bg-white px-4 py-3 font-black uppercase text-black shadow-[4px_4px_0px_0px_#000] transition-colors hover:bg-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => onPay(payment.referenceCode)}
                          disabled={isLoading}
                          className="bg-black text-white px-5 py-3 font-black uppercase border-4 border-black hover:bg-cyan-300 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_#000]"
                        >
                          {isLoading ? 'Processing...' : 'Pay Now'}
                        </button>
                      </div>
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
