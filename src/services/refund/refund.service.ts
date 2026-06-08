import { apiFetch } from '@/lib/api';
import { expectJson, getErrorMessage, readJson } from '@/lib/http';
import { RefundRequest, RefundResponse } from '@/types/wallet';

export const RefundService = {
  requestRefund: async (data: RefundRequest): Promise<RefundResponse> => {
    const res = await apiFetch('/refunds', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(await getErrorMessage(res, 'Failed to request refund'));
    }

    return expectJson<RefundResponse>(res, 'Failed to request refund');
  },

  getMyRefunds: async (): Promise<RefundResponse[]> => {
    const res = await apiFetch('/refunds/me');

    if (!res.ok) {
      throw new Error(await getErrorMessage(res, 'Failed to fetch refunds'));
    }

    return (await readJson<RefundResponse[]>(res)) || [];
  },

  getMyJastiperRefunds: async (): Promise<RefundResponse[]> => {
    const res = await apiFetch('/jastiper/refunds/me');

    if (!res.ok) {
      throw new Error(await getErrorMessage(res, 'Failed to fetch Jastiper refunds'));
    }

    return (await readJson<RefundResponse[]>(res)) || [];
  },

  approveJastiperRefund: async (refundId: string): Promise<RefundResponse> => {
    const res = await apiFetch(`/jastiper/refunds/${refundId}/approve`, {
      method: 'PATCH',
    });

    if (!res.ok) {
      throw new Error(await getErrorMessage(res, 'Failed to approve refund'));
    }

    return expectJson<RefundResponse>(res, 'Failed to approve refund');
  },

  rejectJastiperRefund: async (refundId: string): Promise<RefundResponse> => {
    const res = await apiFetch(`/jastiper/refunds/${refundId}/reject`, {
      method: 'PATCH',
    });

    if (!res.ok) {
      throw new Error(await getErrorMessage(res, 'Failed to reject refund'));
    }

    return expectJson<RefundResponse>(res, 'Failed to reject refund');
  },
};
