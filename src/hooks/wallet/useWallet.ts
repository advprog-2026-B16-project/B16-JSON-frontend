import { useState, useCallback, useEffect } from 'react';

import { Transaction } from '@/types/wallet';
import { WalletService } from '@/services/wallet/wallet.service';

type WalletActionType = 'topup' | 'withdraw';

export const useWallet = (initialUserId: string) => {
  const [userId, setUserId] = useState(initialUserId);

  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearAlerts = () => {
    setError('');
    setSuccess('');
  };

  const fetchWalletData = useCallback(async () => {
    if (!userId) {
      setBalance(null);
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const [balanceData, transactionData] = await Promise.all([
        WalletService.getWalletBalance(userId),

        WalletService.getTransactions(userId).catch(() => [])
      ]);

      setBalance(balanceData);
      setTransactions(transactionData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch wallet data'
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleAction = async (
    type: WalletActionType,
    amount: number
  ) => {
    if (!amount || amount <= 0) {
      setError(`Please enter a valid ${type} amount`);
      return false;
    }

    if (
      type === 'withdraw' &&
      balance !== null &&
      amount > balance
    ) {
      setError('Insufficient funds');
      return false;
    }

    setActionLoading(true);

    clearAlerts();

    try {
      if (type === 'topup') {
        await WalletService.topUp({
          userId,
          amount
        });
      } else {
        await WalletService.withdraw({
          userId,
          amount
        });
      }

      setSuccess(
        `Successfully ${
          type === 'topup'
            ? 'topped up'
            : 'withdrew'
        } $${amount}`
      );

      await fetchWalletData();

      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `${type} failed`
      );

      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmTopUp = async (transactionId: string) => {
    setActionLoading(true);
    clearAlerts();

    try {
      await WalletService.confirmTopUp(transactionId);
      setSuccess('Top-up confirmed successfully');
      await fetchWalletData();
      return true;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Top-up confirmation failed'
      );
      return false;
    } finally {
      setActionLoading(false);
    }
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
    handleConfirmTopUp,
    clearAlerts
  };
};