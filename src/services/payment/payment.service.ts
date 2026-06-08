import { apiFetch } from '@/lib/api';
import { getErrorMessage } from '@/lib/http';
import { PaymentRequest, PaymentResponse } from '@/types/wallet';

export const PaymentService = {
  createPayment: async (data: PaymentRequest): Promise<PaymentResponse> => {
    const res = await apiFetch('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(await getErrorMessage(res, 'Failed to create payment'));
    }

    return await res.json();
  },

  pay: async (referenceCode: string): Promise<PaymentResponse> => {
    const res = await apiFetch(`/payments/${referenceCode}/pay`, {
      method: 'POST',
    });

    if (!res.ok) {
      throw new Error(await getErrorMessage(res, 'Failed to complete payment'));
    }

    return await res.json();
  },

  cancelPayment: async (referenceCode: string): Promise<PaymentResponse> => {
    const res = await apiFetch(`/payments/${referenceCode}/cancel`, {
      method: 'PATCH',
    });

    if (!res.ok) {
      throw new Error(await getErrorMessage(res, 'Failed to cancel payment'));
    }

    return await res.json();
  },

  getMyPayments: async (): Promise<PaymentResponse[]> => {
    const res = await apiFetch('/payments/me');

    if (!res.ok) {
      throw new Error(await getErrorMessage(res, 'Failed to fetch payments'));
    }

    return await res.json();
  },
};
