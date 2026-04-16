import { useState, useCallback, useEffect } from 'react';
import { Transaction } from '@/types/wallet';
import { WalletService } from '@/services/wallet/wallet.service';

export const useWallet = (initialUserId: string = 'user123') => {
  const [userId, setUserId] = useState<string>(initialUserId);
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const fetchWalletData = useCallback(async () => {
    if (!userId) {
      setBalance(null);
      setTransactions([]);
      return;
    }
    setIsLoading(true);
    setError('');
    
    try {
      const [balanceData, txData] = await Promise.all([
        WalletService.getWalletBalance(userId),
        WalletService.getTransactions(userId).catch(() => []) 
      ]);
      setBalance(balanceData);
      setTransactions(txData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallet data');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleAction = async (type: 'topup' | 'withdraw', amountStr: string) => {
    if (!amountStr || isNaN(Number(amountStr)) || Number(amountStr) <= 0) {
      setError(`Please enter a valid ${type} amount`);
      return false;
    }

    const amount = Number(amountStr);

    if (type === 'withdraw' && balance !== null && amount > balance) {
      setError('Insufficient funds');
      return false;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      if (type === 'topup') {
        await WalletService.topUp({ userId, amount });
      } else {
        await WalletService.withdraw({ userId, amount });
      }

      setSuccess(`Successfully ${type === 'topup' ? 'topped up' : 'withdrew'} $${amount}`);
      await fetchWalletData();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : `${type} error`);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const clearAlerts = () => {
    setError('');
    setSuccess('');
  };

  return {
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
    clearAlerts
  };
};
