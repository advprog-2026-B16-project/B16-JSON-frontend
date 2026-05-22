'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useWallet } from '@/hooks/wallet/useWallet';
import {
  WalletHeader,
  WalletBalance,
  WalletActionForm,
  TransactionHistory
} from '@/features/wallet/components';
import { formatDollar } from '@/lib/currency';

export default function WalletClient({ initialUserId }: { initialUserId: string }) {
  const router = useRouter();
  
  const {
    userId,
    balance,
    transactions,
    isLoading,
    actionLoading,
    error,
    fetchWalletData,
    handleAction,
  } = useWallet(initialUserId);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    confirmStyle?: string;
  } | null>(null);

  const confirmAction = (title: string, message: string, onConfirm: () => void, confirmText = 'CONFIRM', confirmStyle = 'bg-yellow-400 hover:bg-yellow-500 text-black') => {
    setModalConfig({ title, message, onConfirm, confirmText, confirmStyle });
    setModalOpen(true);
  };

  const handleActionWithConfirm = (type: 'topup' | 'withdraw', amount: number) => {
    const formattedAmount = formatDollar(amount);
    
    if (type === 'topup') {
      confirmAction(
        'CONFIRM TOP UP',
        `Are you sure you want to top up your wallet with ${formattedAmount}?`,
        () => handleAction(type, amount),
        'TOP UP',
        'bg-emerald-400 hover:bg-emerald-500 text-black'
      );
    } else {
      confirmAction(
        'CONFIRM WITHDRAWAL',
        `Are you sure you want to withdraw ${formattedAmount} from your wallet?`,
        () => handleAction(type, amount),
        'WITHDRAW',
        'bg-pink-400 hover:bg-pink-500 text-black'
      );
    }
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
        className="w-full max-w-4xl flex flex-col lg:flex-row gap-8"
      >
        {/* Left Side: Wallet Actions */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000] text-black">
            
            <WalletHeader 
              isLoading={isLoading || actionLoading} 
              onRefresh={fetchWalletData} 
            />

            {/* Alerts */}
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-400 border-4 border-black p-4 mb-6 font-bold shadow-[4px_4px_0px_0px_#000]">
                {error}
              </motion.div>
            )}

            <WalletBalance 
              balance={balance} 
              isLoading={isLoading} 
            />

            <div className="flex flex-col gap-6">
              <WalletActionForm 
                type="topup" 
                isLoading={actionLoading || isLoading || !userId} 
                onSubmit={handleActionWithConfirm} 
              />
              
              <WalletActionForm 
                type="withdraw" 
                isLoading={actionLoading || isLoading || !userId} 
                maxAmount={balance}
                onSubmit={handleActionWithConfirm} 
              />
            </div>
            
          </div>
        </div>

        {/* Right Side: Transaction History */}
        <div className="w-full lg:w-1/2 flex flex-col h-full">
          <TransactionHistory 
            transactions={transactions} 
          />
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {modalOpen && modalConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000] max-w-md w-full"
            >
              <h2 className="text-3xl font-black uppercase mb-4 tracking-tight text-black">{modalConfig.title}</h2>
              <p className="font-bold text-gray-700 mb-8">{modalConfig.message}</p>
              
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2 border-4 border-black font-black uppercase hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none text-black"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setModalOpen(false);
                    modalConfig.onConfirm();
                  }}
                  className={`px-6 py-2 border-4 border-black font-black uppercase transition-all shadow-[4px_4px_0px_0px_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none ${modalConfig.confirmStyle}`}
                >
                  {modalConfig.confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
