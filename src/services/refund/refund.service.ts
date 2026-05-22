import { apiFetch } from '@/lib/api';
import { RefundRequest, RefundResponse } from '@/types/wallet';

async function readJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text) as T;
}

async function getErrorMessage(response: Response, fallback: string) {
  const data = await readJson<{ detail?: string; message?: string; title?: string }>(response).catch(() => null);
  return data?.detail || data?.message || data?.title || fallback;
}

export const RefundService = {
  requestRefund: async (data: RefundRequest): Promise<RefundResponse> => {
    const res = await apiFetch('/refunds', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(await getErrorMessage(res, 'Failed to request refund'));
    }

    const refund = await readJson<RefundResponse>(res);
    if (!refund) throw new Error('Refund response was empty');
    return refund;
  },

  getMyRefunds: async (): Promise<RefundResponse[]> => {
    const res = await apiFetch('/refunds/me');

    if (!res.ok) {
      throw new Error(await getErrorMessage(res, 'Failed to fetch refunds'));
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

    const refund = await readJson<RefundResponse>(res);
    if (!refund) throw new Error('Refund response was empty');
    return refund;
  },
};
