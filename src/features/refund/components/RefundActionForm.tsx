import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  isLoading: boolean;
  onSubmit: (transactionId: string, reason: string) => void;
  initialTransactionId?: string;
}

export function RefundActionForm({ isLoading, onSubmit, initialTransactionId }: Props) {
  const [transactionId, setTransactionId] = useState(initialTransactionId || '');
  const [prevInitial, setPrevInitial] = useState(initialTransactionId);
  const [reason, setReason] = useState('');

  if (initialTransactionId !== prevInitial) {
    setPrevInitial(initialTransactionId);
    setTransactionId(initialTransactionId || '');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId || !reason) return;
    onSubmit(transactionId, reason);
    setTransactionId('');
    setReason('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-purple-100 p-6 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
      <h3 className="text-xl font-black uppercase">Request Refund</h3>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="transactionId" className="font-bold">Transaction ID</label>
        <div className="relative">
          <input
            id="transactionId"
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            disabled={isLoading}
            placeholder="Enter Transaction ID"
            className="w-full p-3 border-4 border-black font-mono font-bold focus:outline-none focus:ring-4 focus:ring-black/20 transition-all disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="reason" className="font-bold">Reason</label>
        <div className="relative">
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isLoading}
            placeholder="Why do you need a refund?"
            rows={3}
            className="w-full p-3 border-4 border-black font-medium focus:outline-none focus:ring-4 focus:ring-black/20 transition-all disabled:opacity-50 resize-none"
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading || !transactionId || !reason}
        className="w-full mt-2 bg-black text-white p-4 font-black uppercase text-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Processing...' : 'Submit Request'}
      </motion.button>
    </form>
  );
}
