import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Props {
  isLoading: boolean;
  onSubmit: (orderId: string) => void;
  initialOrderId?: string;
}

export function PaymentActionForm({ isLoading, onSubmit, initialOrderId }: Props) {
  const [orderId, setOrderId] = useState(initialOrderId || '');

  useEffect(() => {
    if (initialOrderId) {
      setOrderId(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;
    onSubmit(orderId);
    setOrderId('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-cyan-100 p-6 border-4 border-black shadow-[8px_8px_0px_0px_#000]">
      <h3 className="text-xl font-black uppercase">Create Payment</h3>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="orderId" className="font-bold">Order ID</label>
        <div className="relative">
          <input
            id="orderId"
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            disabled={isLoading}
            placeholder="Enter Order ID to pay"
            className="w-full p-3 border-4 border-black font-mono font-bold focus:outline-none focus:ring-4 focus:ring-black/20 transition-all disabled:opacity-50"
          />
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isLoading || !orderId}
        className="w-full mt-2 bg-black text-white p-4 font-black uppercase text-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Processing...' : 'Initiate Payment'}
      </motion.button>
    </form>
  );
}
