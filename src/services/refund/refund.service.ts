import { apiFetch } from '@/lib/api';
import { RefundRequest, RefundResponse } from '@/types/wallet';

export const RefundService = {
  requestRefund: async (data: RefundRequest): Promise<RefundResponse> => {
    const res = await apiFetch('/refunds', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error('Failed to request refund');
    }

    return await res.json();
  },

  getMyRefunds: async (): Promise<RefundResponse[]> => {
    const res = await apiFetch('/refunds/me');

    if (!res.ok) {
      throw new Error('Failed to fetch refunds');
    }

    return await res.json();
  },
};
