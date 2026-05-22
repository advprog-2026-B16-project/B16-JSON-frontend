import { useState, useCallback, useEffect } from 'react';
import { PaymentResponse, PaymentRequest } from '@/types/wallet';
import { PaymentService } from '@/services/payment/payment.service';

export const usePayments = () => {
  const [payments, setPayments] = useState<PaymentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const clearAlerts = () => {
    setError('');
    setSuccess('');
  };

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await PaymentService.getMyPayments();
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const createPayment = async (data: PaymentRequest) => {
    setActionLoading(true);
    clearAlerts();
    try {
      await PaymentService.createPayment(data);
      setSuccess('Payment created successfully!');
      await fetchPayments();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create payment');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const pay = async (referenceCode: string) => {
    setActionLoading(true);
    clearAlerts();
    try {
      await PaymentService.pay(referenceCode);
      setSuccess('Payment completed successfully!');
      await fetchPayments();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete payment');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    payments,
    isLoading,
    actionLoading,
    error,
    success,
    fetchPayments,
    createPayment,
    pay,
    clearAlerts,
  };
};
