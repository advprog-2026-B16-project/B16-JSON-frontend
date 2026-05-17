import { Transaction } from '@/types/wallet';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowDownRight, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

export function TransactionHistory({ transactions }: Props) {
  const isPositive = (type: string) => type === 'TOP_UP' || type === 'REFUND';

  return (
    <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000] text-black h-full overflow-hidden flex flex-col">
      <div className="flex items-center gap-4 border-b-4 border-black pb-6 mb-6 shrink-0">
        <div className="bg-yellow-300 border-4 border-black p-3 shadow-[4px_4px_0px_0px_#000]">
          <Clock size={28} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tight">History</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[600px] styled-scrollbar">
        <AnimatePresence>
          {transactions.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="flex flex-col items-center justify-center py-12 text-center text-gray-400"
            >
              <Clock size={48} className="mb-4 opacity-50" />
              <p className="text-xl font-black uppercase italic">No transactions yet</p>
              <p className="font-bold">Top up your wallet to get started!</p>
            </motion.div>
          ) : (
            [...transactions].map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-4 border-black p-4 shadow-[4px_4px_0px_0px_#000] flex items-center justify-between hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2 border-2 border-black ${isPositive(tx.type) ? 'bg-green-200' : 'bg-red-200'}`}>
                    {isPositive(tx.type) ? <ArrowDownRight size={20} className="text-green-700" /> : <ArrowUpRight size={20} className="text-red-700" />}
                  </div>
                  <div>
                    <p className="font-black text-lg">{tx.type.replace('_', ' ')}</p>
                    <div className="flex items-center gap-2 text-xs font-bold font-mono text-gray-500">
                      <span className="flex items-center gap-1">
                        {tx.status === 'SUCCESS' && <CheckCircle2 size={12} className="text-green-600" />}
                        {tx.status === 'FAILED' && <XCircle size={12} className="text-red-600" />}
                        {tx.status}
                      </span>
                    </div>
                    {tx.description && (
                      <p className="text-xs font-medium text-gray-600 mt-1 italic">&quot;{tx.description}&quot;</p>
                    )}
                  </div>
                </div>
                <div className={`text-xl font-black ${isPositive(tx.type) ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive(tx.type) ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
