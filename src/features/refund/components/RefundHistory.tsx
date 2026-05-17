import { RefundResponse } from '@/types/wallet';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface Props {
  refunds: RefundResponse[];
}

export function RefundHistory({ refunds }: Props) {
  return (
    <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000] text-black h-full overflow-hidden flex flex-col">
      <div className="flex items-center gap-4 border-b-4 border-black pb-6 mb-6 shrink-0">
        <div className="bg-purple-300 border-4 border-black p-3 shadow-[4px_4px_0px_0px_#000]">
          <RotateCcw size={28} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight">Refunds</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[600px] styled-scrollbar">
        <AnimatePresence>
          {refunds.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col items-center justify-center py-12 text-center text-gray-400"
            >
              <RotateCcw size={48} className="mb-4 opacity-50" />
              <p className="text-xl font-black uppercase italic">No refunds found</p>
              <p className="font-bold">You have not requested any refunds yet.</p>
            </motion.div>
          ) : (
            [...refunds].reverse().map((refund) => (
              <motion.div
                key={refund.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] flex items-center justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-black text-lg">Order: {refund.orderId.slice(0,8)}...</p>
                    <div className="flex items-center gap-2 text-xs font-bold font-mono text-gray-500">
                      <span>Tx: {refund.originalTransactionId.slice(0,8)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        {refund.status === 'SUCCESS' && <CheckCircle2 size={12} className="text-green-600" />}
                        {refund.status === 'FAILED' && <XCircle size={12} className="text-red-600" />}
                        {refund.status === 'PENDING' && <AlertCircle size={12} className="text-yellow-600" />}
                        {refund.status}
                      </span>
                    </div>
                    {refund.reason && (
                      <p className="text-xs font-medium text-gray-600 mt-1 italic">&quot;{refund.reason}&quot;</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`text-xl font-black ${refund.status === 'SUCCESS' ? 'text-green-600' : 'text-black'}`}>
                    ${refund.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
