import { Transaction, WalletActionRequest } from '@/types/wallet';
import { apiFetch } from '@/lib/api';

export const WalletService = {

  getWalletBalance: async (userId: string): Promise<number> => {
    const res = await apiFetch(`/wallet/${userId}`);

    if (!res.ok) {
      throw new Error('Failed to fetch wallet balance');
    }

    const data = await res.json();

    return Number(data.balance) || 0;
  },

  getTransactions: async (userId: string): Promise<Transaction[]> => {
    const res = await apiFetch(`/transaction/${userId}`);

    if (!res.ok) {
      throw new Error('Failed to fetch transactions');
    }

    return await res.json();
  },

  topUp: async (data: WalletActionRequest): Promise<Transaction> => {
    const res = await apiFetch(`/wallet/topup/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      throw new Error('Top-up failed');
    }

    return await res.json();
  },

  confirmTopUp: async (transactionId: string): Promise<string> => {
    const res = await apiFetch(
      `/wallet/topup/confirm/${transactionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!res.ok) {
      throw new Error('Top-up confirmation failed');
    }

    return await res.text();
  },

  withdraw: async (data: WalletActionRequest): Promise<string> => {
    const res = await apiFetch(`/wallet/withdraw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      throw new Error('Withdraw failed');
    }

    return await res.text();
  }
};