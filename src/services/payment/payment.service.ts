import { apiFetch } from '@/lib/api';
import { PaymentRequest, PaymentResponse } from '@/types/wallet';

async function readErrorMessage(response: Response, fallback: string) {
  const text = await response.text().catch(() => '');
  if (!text) return fallback;

  try {
    const data = JSON.parse(text) as {
      detail?: string;
      message?: string;
      title?: string;
      error?: string;
    };
    return data.detail || data.message || data.error || data.title || fallback;
  } catch {
    return text || fallback;
  }
}

export const PaymentService = {
  createPayment: async (data: PaymentRequest): Promise<PaymentResponse> => {
    const res = await apiFetch('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res, 'Failed to create payment'));
    }

    return await res.json();
  },

  pay: async (referenceCode: string): Promise<PaymentResponse> => {
    const res = await apiFetch(`/payments/${referenceCode}/pay`, {
      method: 'POST',
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res, 'Failed to complete payment'));
    }

    return await res.json();
  },

  cancelPayment: async (referenceCode: string): Promise<PaymentResponse> => {
    const res = await apiFetch(`/payments/${referenceCode}/cancel`, {
      method: 'PATCH',
    });

    if (!res.ok) {
      throw new Error(await readErrorMessage(res, 'Failed to cancel payment'));
    }

    return await res.json();
  },

  getMyPayments: async (): Promise<PaymentResponse[]> => {
    const res = await apiFetch('/payments/me');

    if (!res.ok) {
      throw new Error(await readErrorMessage(res, 'Failed to fetch payments'));
    }

    return await res.json();
  },
};
