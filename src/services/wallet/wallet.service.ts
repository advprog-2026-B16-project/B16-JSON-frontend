import { Transaction, WalletActionRequest } from '@/types/wallet';
import { apiFetch } from '@/lib/api';

export const WalletService = {
  getWalletBalance: async (userId: string): Promise<number> => {
    const res = await apiFetch(`/wallet/${userId}`);
    if (!res.ok) {
      throw new Error('Failed to fetch wallet balance');
    }
    const data = await res.text();
    return Number(data) || 0;
  },

  getTransactions: async (userId: string): Promise<Transaction[]> => {
    const res = await apiFetch(`/wallet/${userId}/transactions`);
    if (!res.ok) {
      throw new Error('Failed to fetch transactions');
    }
    return res.json();
  },

  topUp: async (data: WalletActionRequest): Promise<void> => {
    const res = await apiFetch(`/wallet/topup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      throw new Error('Top-up failed');
    }
  },

  withdraw: async (data: WalletActionRequest): Promise<void> => {
    const res = await apiFetch(`/wallet/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      throw new Error('Withdraw failed');
    }
  }
};
