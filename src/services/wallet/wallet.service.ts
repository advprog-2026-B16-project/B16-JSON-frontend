import { Transaction, WalletActionRequest } from '@/types/wallet';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const WalletService = {
  getWalletBalance: async (userId: string): Promise<number> => {
    const res = await fetch(`${API_URL}/api/wallet/${userId}`);
    if (!res.ok) {
      throw new Error('Failed to fetch wallet balance');
    }
    const data = await res.text();
    return Number(data) || 0;
  },

  getTransactions: async (userId: string): Promise<Transaction[]> => {
    const res = await fetch(`${API_URL}/api/wallet/${userId}/transactions`);
    if (!res.ok) {
      throw new Error('Failed to fetch transactions');
    }
    return res.json();
  },

  topUp: async (data: WalletActionRequest): Promise<void> => {
    const res = await fetch(`${API_URL}/api/wallet/topup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      throw new Error('Top-up failed');
    }
  },

  withdraw: async (data: WalletActionRequest): Promise<void> => {
    const res = await fetch(`${API_URL}/api/wallet/withdraw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      throw new Error('Withdraw failed');
    }
  }
};
