'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useWallet } from '@/hooks/wallet/useWallet';
import {
  WalletHeader,
  UserIdConfigurator,
  WalletBalance,
  WalletActionForm,
  TransactionHistory
} from '@/features/wallet/components';

export default function WalletPage() {
  const router = useRouter();
  
  const {
    userId,
    setUserId,
    balance,
    transactions,
    isLoading,
    actionLoading,
    error,
    success,
    fetchWalletData,
    handleAction,
  } = useWallet('user123');

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

            <UserIdConfigurator 
              userId={userId} 
              setUserId={setUserId} 
            />

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

            <WalletBalance 
              balance={balance} 
              isLoading={isLoading} 
            />

            <div className="flex flex-col gap-6">
              <WalletActionForm 
                type="topup" 
                isLoading={actionLoading || isLoading || !userId} 
                onSubmit={handleAction} 
              />
              
              <WalletActionForm 
                type="withdraw" 
                isLoading={actionLoading || isLoading || !userId} 
                maxAmount={balance}
                onSubmit={handleAction} 
              />
            </div>
            
          </div>
        </div>

        {/* Right Side: Transaction History */}
        <div className="w-full lg:w-1/2 flex flex-col h-full">
          <TransactionHistory transactions={transactions} />
        </div>
      </motion.div>
    </div>
  );
}
