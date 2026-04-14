'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Wallet, Plus, Minus, RefreshCw, ArrowLeft, User } from 'lucide-react';

export default function WalletPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string>('user123');// test
  
  const [balance, setBalance] = useState<number | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const fetchWallet = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${userId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch wallet balance');
      }
      const data = await res.json();
      setBalance(data.balance ?? 0);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpAmount || isNaN(Number(topUpAmount)) || Number(topUpAmount) <= 0) {
      setError('Please enter a valid top-up amount');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid: userId, amount: Number(topUpAmount) })
      });

      if (!res.ok) {
        throw new Error('Top-up failed');
      }

      const data = await res.json();
      
      if (data.balance !== undefined) {
        setBalance(data.balance);
      } else {
        setBalance((prev) => (prev ?? 0) + Number(topUpAmount));
      }
      
      setSuccess(`Successfully topped up $${topUpAmount}`);
      setTopUpAmount('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Top-up error';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0) {
      setError('Please enter a valid withdraw amount');
      return;
    }

    if (balance !== null && Number(withdrawAmount) > balance) {
      setError('Insufficient funds');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid: userId, amount: Number(withdrawAmount) })
      });

      if (!res.ok) {
        throw new Error('Withdraw failed');
      }

      const data = await res.json();
      
      if (data.balance !== undefined) {
        setBalance(data.balance);
      } else {
        setBalance((prev) => (prev ?? 0) - Number(withdrawAmount));
      }

      setSuccess(`Successfully withdrew $${withdrawAmount}`);
      setWithdrawAmount('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Withdraw error';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 py-12">
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
        className="w-full max-w-xl"
      >
        <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000] text-black">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b-4 border-black pb-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-300 border-4 border-black p-3 shadow-[4px_4px_0px_0px_#000]">
                <Wallet size={36} strokeWidth={2.5} />
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tight">Wallet</h1>
            </div>
            <button 
              onClick={fetchWallet} 
              disabled={isLoading || actionLoading}
              className="bg-purple-300 border-4 border-black p-3 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50"
              title="Refresh Balance"
            >
              <RefreshCw size={24} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* User ID Configurator */}
          <div className="mb-6 flex items-center gap-4">
            <div className="bg-yellow-200 border-4 border-black p-2 shadow-[2px_2px_0px_0px_#000]">
              <User size={20} />
            </div>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter User ID..."
              className="flex-1 bg-white border-4 border-black p-2 font-bold focus:outline-none focus:bg-yellow-50 transition-colors shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px]"
            />
          </div>

          {/* Alerts */}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-400 border-4 border-black p-4 mb-6 font-bold shadow-[4px_4px_0px_0px_#000]">
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-400 border-4 border-black p-4 mb-6 font-bold shadow-[4px_4px_0px_0px_#000]">
              {success}
            </motion.div>
          )}

          {/* Balance Display */}
          <div className="bg-cyan-200 border-4 border-black p-6 mb-8 shadow-[8px_8px_0px_0px_#000] text-center relative overflow-hidden">
            <h2 className="text-xl font-bold uppercase mb-2">Current Balance</h2>
            <div className="text-5xl font-black truncate">
              {isLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : balance !== null ? (
                `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
              ) : (
                '--'
              )}
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 bg-yellow-300 border-4 border-black w-16 h-16 rounded-full opacity-50"></div>
            <div className="absolute -bottom-6 -left-6 bg-pink-300 border-4 border-black w-24 h-24 rounded-full opacity-50"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Top Up Form */}
            <div className="border-4 border-black p-5 shadow-[4px_4px_0px_0px_#000] bg-pink-50 relative">
              <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
                <Plus size={24} className="text-green-600" strokeWidth={4} /> Top Up
              </h3>
              <form onSubmit={handleTopUp} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl">$</span>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white border-4 border-black p-3 pl-10 font-bold focus:outline-none focus:bg-pink-100 transition-colors shadow-[2px_2px_0px_0px_#000] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={actionLoading || isLoading || !userId}
                  className="w-full bg-green-400 border-4 border-black py-3 font-black uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Top-Up'}
                </button>
              </form>
            </div>

            {/* Withdraw Form */}
            <div className="border-4 border-black p-5 shadow-[4px_4px_0px_0px_#000] bg-purple-50 relative">
              <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
                <Minus size={24} className="text-red-600" strokeWidth={4} /> Withdraw
              </h3>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl">$</span>
                  <input
                    type="number"
                    min="1"
                    max={balance !== null ? balance : undefined}
                    step="0.01"
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white border-4 border-black p-3 pl-10 font-bold focus:outline-none focus:bg-purple-100 transition-colors shadow-[2px_2px_0px_0px_#000] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={actionLoading || isLoading || !userId || (balance !== null && Number(withdrawAmount) > balance)}
                  className="w-full bg-pink-400 border-4 border-black py-3 font-black uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Processing...' : 'Confirm Withdraw'}
                </button>
              </form>
            </div>
          </div>
          
        </div>
      </motion.div>
    </div>
  );
}
