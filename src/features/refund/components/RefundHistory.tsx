import { RefundResponse } from '@/types/wallet';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, XCircle, AlertCircle, ReceiptText } from 'lucide-react';
import { formatCompactDollar, formatDollar } from '@/lib/currency';
import { formatShortId } from '@/lib/ids';
import { getRefundStatusLabel } from '@/lib/refundStatus';

interface Props {
  refunds: RefundResponse[];
}

const statusStyle = {
  SUCCESS: 'bg-green-400 text-black',
  FAILED: 'bg-red-400 text-white',
  PENDING: 'bg-yellow-300 text-black',
};

function StatusIcon({ status }: { status: RefundResponse['status'] }) {
  if (status === 'SUCCESS') return <CheckCircle2 size={14} className="text-green-700" />;
  if (status === 'FAILED') return <XCircle size={14} className="text-red-700" />;
  return <AlertCircle size={14} className="text-yellow-700" />;
}

export function RefundHistory({ refunds }: Props) {
  return (
    <div className="flex h-full flex-col overflow-hidden border-4 border-black bg-white p-8 text-black shadow-[12px_12px_0px_0px_#000]">
      <div className="mb-6 flex shrink-0 items-center gap-4 border-b-4 border-black pb-6">
        <div className="border-4 border-black bg-purple-300 p-3 shadow-[4px_4px_0px_0px_#000]">
          <RotateCcw size={28} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-xs font-black uppercase text-gray-500">Refund Center</p>
          <h2 className="text-3xl font-black uppercase tracking-tight">Claim History</h2>
        </div>
      </div>

      <div className="styled-scrollbar max-h-[620px] flex-1 space-y-4 overflow-y-auto pr-2">
        <AnimatePresence>
          {refunds.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center text-gray-400"
            >
              <ReceiptText size={48} className="mb-4 opacity-50" />
              <p className="text-xl font-black uppercase italic">No refunds found</p>
              <p className="font-bold">Refund claims you submit will appear here.</p>
            </motion.div>
          ) : (
            [...refunds].reverse().map((refund) => (
              <motion.div
                key={refund.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4 border-4 border-black bg-gray-50 p-4 shadow-[4px_4px_0px_0px_#000] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-lg font-black uppercase" title={refund.orderId}>Order {formatShortId(refund.orderId)}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-gray-500">
                      <span className="max-w-[220px] truncate font-mono" title={refund.originalTransactionId}>
                        Tx: {formatShortId(refund.originalTransactionId)}
                      </span>
                      <span>|</span>
                      <span className="flex items-center gap-1">
                        <StatusIcon status={refund.status} />
                        {getRefundStatusLabel(refund.status)}
                      </span>
                    </div>
                  </div>
                  <p className={`max-w-[160px] truncate text-right text-xl font-black ${refund.status === 'SUCCESS' ? 'text-green-600' : 'text-black'}`} title={formatDollar(refund.amount)}>
                    {formatCompactDollar(refund.amount)}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 border-t-2 border-black pt-3 text-sm font-bold md:grid-cols-2">
                  <div>
                    <span className="block text-xs font-black uppercase text-gray-500">Refund Tx</span>
                    <span className="block truncate font-mono" title={refund.refundTransactionId || 'N/A'}>{formatShortId(refund.refundTransactionId)}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-black uppercase text-gray-500">Status</span>
                    <span className={`inline-flex border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000] ${statusStyle[refund.status]}`}>
                      {getRefundStatusLabel(refund.status)}
                    </span>
                  </div>
                </div>

                {refund.reason && (
                  <p className="border-l-4 border-purple-400 bg-white px-3 py-2 text-sm font-bold text-gray-700">
                    &quot;{refund.reason}&quot;
                  </p>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
